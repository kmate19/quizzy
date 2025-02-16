import { Hono } from "hono";
import auth from "./routes/auth";
import ENV from "./config/env";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import apikey from "./routes/apikey";
import quizzes from "./routes/quizzes";
import meta from "./routes/meta";
import userprofile from "./routes/userprofile";
import { ApiResponse } from "repo";
import { openAPISpecs } from "hono-openapi";
import { apiReference } from "@scalar/hono-api-reference";

console.log(ENV.NODE_ENV());

export const app = new Hono()
    .basePath("/api/v1")
    .use(logger())
    .use(cors())
    .route("/", auth)
    .route("/", apikey)
    .route("/", userprofile)
    .route("/", quizzes)
    .route("/", meta)
    .onError((err, c) => {
        // TEST: test this somehow (idk what could cause the fauilure here)
        console.error(err);
        const res = {
            message: "Something went wrong",
            error: {
                message: "Something went wrong",
                case: "server",
            },
        } satisfies ApiResponse;

        return c.json(res, 500);
    });

if (ENV.NODE_ENV() === "development") {
    app.get(
        "/openapi",
        openAPISpecs(app, {
            documentation: {
                info: {
                    title: "Quizzy API",
                    description: "API for Quizzy",
                    version: "1.0.0",
                },
            },
        })
    );
    app.get(
        "/reference",
        apiReference({
            theme: "kepler",
            layout: "classic",
            spec: {
                url: "/api/v1/openapi",
            },
        })
    );
}

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

export default {
    port: port,
    fetch: app.fetch,
};
