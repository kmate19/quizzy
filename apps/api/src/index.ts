import { Context, Hono, Next } from "hono";
import auth from "./routes/auth";
import ENV from "./config/env";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import apikey from "./routes/apikey";
import userprofile from "./routes/userprofile";

console.log(ENV.NODE_ENV())

const logging = ENV.NODE_ENV() === "development" ? logger() : (_: Context, next: Next) => next();

export const app = new Hono().basePath("/api/v1")
    .use(logging)
    .use(cors())
    .route('/', auth)
    .route('/', apikey)
    .route('/', userprofile)

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

export default {
    port: port,
    fetch: app.fetch
};
