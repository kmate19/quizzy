import { Hono } from "hono";
import auth from "./routes/auth.ts";
import checkJwt from "./middlewares/checkJwt.ts";
import ENV from "./config/env.ts";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import apikey from "./routes/apikey.ts";

console.log(ENV.NODE_ENV())

const app = new Hono()

if (ENV.NODE_ENV() === "development") app.use(logger());

app.basePath("/api/v1")
    .use(cors())
    .route('/', auth)
    .use(checkJwt())
    .get("/protected", async (c) => {
        return c.text("You are authorized!");
    })
    .use(checkJwt("admin"))
    .route('/', apikey)
//.get("/protected-admin", async (c) => {
//    return c.text("You are authorized as an admin!");
//});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

export default {
    port: port,
    fetch: app.fetch
};

export type AppType = typeof app;
