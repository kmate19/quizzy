import GLOBALS from "@/config/globals";
import db from "@/db/index";
import { postApiKeySchema, userApiKeys } from "@/db/schemas/userApiKeysSchema";
import checkJwt from "@/middlewares/check-jwt";
import { zv } from "@/middlewares/zv";
import { eq, sql } from "drizzle-orm";
import type { ApiResponse } from "repo";

const createHandler = GLOBALS.CONTROLLER_FACTORY(
    checkJwt("admin"),
    zv("json", postApiKeySchema),
    async (c) => {
        const apiKeyData = c.req.valid("json");

        const key = generateApiKey();

        const keys = await db.query.userApiKeys.findMany({
            where: eq(userApiKeys.user_id, c.get("accessTokenPayload").userId),
        });

        if (keys.length >= GLOBALS.MAX_ACTIVE_API_KEYS) {
            const res = {
                message: "You have reached the maximum number of API keys",
                error: {
                    message: "You have reached the maximum number of API keys",
                    case: "forbidden",
                },
            } satisfies ApiResponse;
            return c.json(res, 403);
        }

        const [id_by_user] = await db
            .select({ maxId: sql<number>`count(*)` })
            .from(userApiKeys)
            .where(eq(userApiKeys.user_id, c.get("accessTokenPayload").userId));

        await db.insert(userApiKeys).values({
            ...apiKeyData,
            id_by_user: id_by_user.maxId,
            key,
            user_id: c.get("accessTokenPayload").userId,
        });

        const res = {
            message:
                "API key created, you will only see the full key once, so save it",
            data: key,
        } satisfies ApiResponse;
        return c.json(res, 200);
    }
);

function generateApiKey(prefix: string = "pk"): string {
    const charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    const randomChars = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((byte) => charset[byte % charset.length])
        .join("");
    return `${prefix}_${randomChars}`;
}

export default createHandler;
