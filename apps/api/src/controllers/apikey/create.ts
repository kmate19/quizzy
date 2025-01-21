import GLOBALS from "@/config/globals.ts";
import db from "@/db/index.ts";
import { postApiKeySchema, userApiKeys } from "@/db/schemas/userApiKeysSchema.ts";
import { usersTable } from "@/db/schemas/usersSchema.ts";
import checkJwt from "@/middlewares/checkJwt.ts";
import { zValidator } from "@hono/zod-validator";
import type { ApiResponse } from "@repo/types";
import { eq } from "drizzle-orm";

const createHandler = GLOBALS.CONTROLLER_FACTORY(checkJwt("admin"), zValidator("json", postApiKeySchema), async (c) => {
    const apiKeyData = c.req.valid("json");

    // PERF: probably should be in a worker
    const key = generateApiKey();

    const keys = await db.query.userApiKeys.findMany({ where: eq(usersTable.id, c.get("accessTokenPayload").userId) });

    if (keys.length >= GLOBALS.MAX_ACTIVE_API_KEYS) {
        const res = {
            message: "You have reached the maximum number of API keys",
            error: {
                message: "You have reached the maximum number of API keys",
                case: "forbidden"
            }
        } as ApiResponse;
        return c.json(res, 403);
    }

    await db.insert(userApiKeys).values({ ...apiKeyData, key, user_id: c.get("accessTokenPayload").userId });

    const res = {
        message: "API key created, you will only see the full key once, so save it",
        data: key
    } as ApiResponse;
    return c.json(res, 200);
})

function generateApiKey(prefix: string = "pk"): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    const randomChars = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(byte => charset[byte % charset.length])
        .join('');
    return `${prefix}_${randomChars}`;
};

export default createHandler;
