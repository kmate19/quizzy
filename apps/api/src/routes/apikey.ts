import db from "@/db/index.ts";
import { postApiKeySchema, userApiKeys } from "@/db/schemas/userApiKeysSchema.ts";
import { usersTable } from "@/db/schemas/usersSchema.ts";
import postgresErrorHandler from "@/utils/db/postgresErrorHandler.ts";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import type { JWTPayload } from "hono/utils/jwt/types";

const generateApiKey = (length = 32, includeSpecial = true) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' +
        (includeSpecial ? '!@#$%^&*()-_=+[]{}|;:,.<>?' : '');

    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
        .map(byte => charset[byte % charset.length])
        .join('');
};

const apikey = new Hono<{ Variables: { accessTokenPayload: JWTPayload } }>().basePath("/apikey")
    .post("/create", zValidator("json", postApiKeySchema), async (c) => {
        const apiKeyData = c.req.valid("json");

        // NOTE: probably should be in a worker
        const key = generateApiKey();
        try {
            await db.insert(userApiKeys).values({ ...apiKeyData, key, user_id: c.get("accessTokenPayload").userId as string });
        } catch (error) {
            const err = postgresErrorHandler(error as Error & { code: string });

            c.status(400)
            c.json({ error: err.message });
        }

        return c.json({ message: "API key created, you will only see the full key once, so save it", key });
    })

    .get("/list", async (c) => {
        const asd = c.get("accessTokenPayload");

        try {
            const keys = await db.query.usersTable.findFirst({
                where: eq(usersTable.id, asd.userId as string),
                columns: {},
                with: {
                    api_keys: {
                        columns: {
                            user_id: false,
                            id: false,
                        }
                    }
                }
            })
            if (!keys) {
                throw new Error("No keys found");
            }
            // hide the full key
            keys.api_keys.map(key => key.key = key.key.substring(0, 3) + "..." + key.key.substring(key.key.length - 3, key.key.length));
            return c.json({ keys: keys.api_keys });
        } catch (error) {
            c.status(500);
            return c.body('')
        }

    })

    .delete("/delete/:id", async (c) => {
        // Delete an API key
    });

export default apikey;
