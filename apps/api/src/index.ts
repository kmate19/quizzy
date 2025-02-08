import { Context, Hono, Next } from "hono";
import auth from "./routes/auth";
import ENV from "./config/env";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import apikey from "./routes/apikey";
import quizzes from "./routes/quizzes";
import userprofile from "./routes/userprofile";
import { ApiResponse } from "repo";

console.log(ENV.NODE_ENV())

const logging = ENV.NODE_ENV() === "development" ? logger() : (_: Context, next: Next) => next();

export const app = new Hono().basePath("/api/v1")
    .use(logging)
    .use(cors())
    .route('/', auth)
    .route('/', apikey)
    .route('/', userprofile)
    .route('/', quizzes)
    .onError((err, c) => {
        // TEST: test this somehow (idk what could cause the fauilure here)
        console.error(err);
        const res = {
            message: "Something went wrong",
            error: {
                message: "Something went wrong",
                case: "server"
            }
        } satisfies ApiResponse;

        return c.json(res, 500);
    })

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

export default {
    port: port,
    fetch: app.fetch
};
