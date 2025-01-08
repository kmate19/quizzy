import { Hono } from "hono";
import auth from "./routes/auth.ts";
import ENV from "./config/env.ts";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import apikey from "./routes/apikey.ts";

console.log(ENV.NODE_ENV())

const app = new Hono().basePath("/api/v1")
    .use(ENV.NODE_ENV() === "development" ? logger() : async () => { })
    .use(cors())
    .route('/', auth)
    .route('/', apikey)

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

export default {
    port: port,
    fetch: app.fetch
};

export type AppType = typeof app;
