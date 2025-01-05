import db from "@/db/index.ts";
import { postApiKeySchema, userApiKeys } from "@/db/schemas/userApiKeysSchema.ts";
import postgresErrorHandler from "@/utils/db/postgresErrorHandler.ts";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

const apikey = new Hono().basePath("/apikey")

    .post("/create", zValidator("json", postApiKeySchema), async (c) => {
        const apiKeyData = c.req.valid("json");


        // INFO: argon2 slow but secure look more into this
        // apiKeyData.key = await Bun.password.hash(apiKeyData.key);

        apiKeyData.key = await Bun.password.hash(apiKeyData.key, {
            algorithm: "bcrypt",
            cost: 4,
        });

        // INFO: see userApiKeysSchema.ts for more info

        try {
            await db.insert(userApiKeys).values(apiKeyData);
        } catch (error) {
            const err = postgresErrorHandler(error as Error & { code: string });

            c.status(400)
            c.json({ error: err.message });
        }

        return c.json({ message: "API key created" });
    })

    .get("/list", async (c) => {
        // List own API keys
    })

    .delete("/delete/:id", async (c) => {
        // Delete an API key
    });

export default apikey;
