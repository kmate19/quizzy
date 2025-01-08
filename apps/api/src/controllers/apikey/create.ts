import GLOBALS from "@/config/globals.ts";
import db from "@/db/index.ts";
import { postApiKeySchema, userApiKeys } from "@/db/schemas/userApiKeysSchema.ts";
import { usersTable } from "@/db/schemas/usersSchema.ts";
import checkJwt from "@/middlewares/checkJwt.ts";
import postgresErrorHandler from "@/utils/db/postgresErrorHandler.ts";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";

const createHandler = GLOBALS.CONTROLLER_FACTORY(checkJwt("admin"), zValidator("json", postApiKeySchema), async (c) => {
    const apiKeyData = c.req.valid("json");

    // NOTE: probably should be in a worker
    const key = generateApiKey();
    try {
        const keys = await db.query.userApiKeys.findMany({ where: eq(usersTable.id, c.get("accessTokenPayload").userId) });

        if (keys.length >= GLOBALS.MAX_ACTIVE_API_KEYS) throw new Error("You have reached the maximum number of API keys");

        await db.insert(userApiKeys).values({ ...apiKeyData, key, user_id: c.get("accessTokenPayload").userId });
    } catch (error) {
        const err = postgresErrorHandler(error as Error & { code: string });

        c.status(400)
        c.json({ error: err.message });
    }

    return c.json({ message: "API key created, you will only see the full key once, so save it", key });
})

function generateApiKey(prefix: string = "pk"): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    const randomChars = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(byte => charset[byte % charset.length])
        .join('');
    return `${prefix}_${randomChars}`;
};

export default createHandler;
