import { Hono } from "hono";
import auth from "./routes/auth";
import ENV from "./config/env";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import apikey from "./routes/apikey";
import quizzes from "./routes/quizzes";
import meta from "./routes/meta";
import admin from "./routes/admin";
import userprofile from "./routes/userprofile";
import type { ApiResponse } from "repo";
import { openAPISpecs } from "hono-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import events from "./routes/events";
import GLOBALS from "./config/globals";

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
    .route("/", events)
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

        return c.json(res, 422);
    });

if (ENV.NODE_ENV() === "development") {
    app.get(
        "/openapi",
        openAPISpecs(app, {
            documentation: {
                info: {
                    title: "Quizzy API",
                    description: `## Documentation for the Quizzy API

### Note on authentication
Swagger UI 'Try it out' does not support sending cookies automatically.
Obtain the cookie via the /login endpoint and use browser developer tools or,
an external client (like Postman, curl) to include the cookie in requests.`,
                    version: "1.0.0",
                },
                components: {
                    securitySchemes: {
                        ApiKeyAuth: {
                            // Matches the name used in 'security' array
                            type: "apiKey",
                            in: "header",
                            name: "X-Api-Key", // The actual header name
                            description: "API Key for administrative access.",
                        },
                        CookieAuth: {
                            // For JWT cookie
                            type: "apiKey", // Using apiKey type for cookie auth representation
                            in: "cookie",
                            name: GLOBALS.ACCESS_COOKIE_NAME, // Your cookie name
                            description: "Session authentication cookie (JWT).",
                        },
                        BearerAuth: {
                            // For WS secret
                            type: "http",
                            scheme: "bearer",
                            description:
                                "Bearer token for WebSocket/Event authentication (WS_SECRET).",
                        },
                    },
                },
            },
        })
    );
    app.get(
        "/reference",
        apiReference({
            theme: "deepSpace",
            layout: "modern",
            spec: {
                url: "/api/v1/openapi",
            },
        })
    );
}

app.route("/", admin);

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

export default {
    port: port,
    fetch: app.fetch,
};
