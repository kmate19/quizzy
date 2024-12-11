import db from "@/db/index.ts";
import { postApiKeySchema, userApiKeys } from "@/db/schemas/userApiKeysSchema.ts";
import postgresErrorHandler from "@/utils/db/postgresErrorHandler.ts";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

const apikey = new Hono().basePath("/apikey")

    .post("/create", zValidator("json", postApiKeySchema), async (c) => {
        const apiKeyData = c.req.valid("json");

        try {
            await db.insert(userApiKeys).values(apiKeyData);
        } catch (error) {
            const err = postgresErrorHandler(error as Error & { code: string });

            c.status(400)
            c.json({ error: err.message });
        }
    })

    .get("/list", async (c) => {
        // List all API keys
    })

    .delete("/delete/:id", async (c) => {
        // Delete an API key
    });

export default apikey;
