import GLOBALS from "@/config/globals.ts";
import db from "@/db/index.ts";
import { postApiKeySchema, userApiKeys } from "@/db/schemas/userApiKeysSchema.ts";
import { usersTable } from "@/db/schemas/usersSchema.ts";
import postgresErrorHandler from "@/utils/db/postgresErrorHandler.ts";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import type { JWTPayload } from "hono/utils/jwt/types";
import { z } from "zod";

function generateApiKey(prefix: string = "pk"): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    const randomChars = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(byte => charset[byte % charset.length])
        .join('');
    return `${prefix}_${randomChars}`;
};

const apikey = new Hono<{ Variables: { accessTokenPayload: JWTPayload } }>().basePath("/apikey")
    .post("/create", zValidator("json", postApiKeySchema), async (c) => {
        const apiKeyData = c.req.valid("json");

        // NOTE: probably should be in a worker
        const key = generateApiKey();
        try {
            const keys = await db.query.userApiKeys.findMany({ where: eq(usersTable.id, c.get("accessTokenPayload").userId as string) });

            if (keys.length >= GLOBALS.MAX_ACTIVE_API_KEYS) throw new Error("You have reached the maximum number of API keys");

            await db.insert(userApiKeys).values({ ...apiKeyData, key, user_id: c.get("accessTokenPayload").userId as string });
        } catch (error) {
            const err = postgresErrorHandler(error as Error & { code: string });

            c.status(400)
            c.json({ error: err.message });
        }

        return c.json({ message: "API key created, you will only see the full key once, so save it", key });
    })

    .get("/list", async (c) => {
        try {
            const keys = await db.query.userApiKeys.findMany({
                where: eq(userApiKeys.user_id, c.get("accessTokenPayload").userId as string),
                columns: {
                    user_id: false,
                },
            })
            if (!keys) {
                throw new Error("No keys found");
            }
            // hide the full key
            keys.map(key => key.key = key.key.substring(0, 3) + "..." + key.key.substring(key.key.length - 3, key.key.length));
            return c.json({ keys: keys });
        } catch (error) {
            c.status(500);
            return c.body('')
        }

    })

    .delete("/delete/:id", zValidator("param", z.object({ id: z.string().regex(/^\d+$/).transform(Number) })), async (c) => {
        try {
            await db.delete(userApiKeys).where(and(eq(userApiKeys.user_id, c.get("accessTokenPayload").userId as string), eq(userApiKeys.id, c.req.valid("param").id)));
        } catch (error) {
            console.log(error);
            c.status(500);
            return c.body('')
        }

        return c.json({ message: "API key deleted" });
    });

export default apikey;
