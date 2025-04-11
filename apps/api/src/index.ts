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
import { makeRateLimiter } from "./middlewares/ratelimiters";

console.log(ENV.NODE_ENV());

export const app = new Hono()
    .basePath("/api/v1")
    .use(logger())
    .use(cors())
    .use(makeRateLimiter(1, 60, "maybe"))
    .route("/", auth)
    .route("/", apikey)
    .route("/", userprofile)
    .route("/", quizzes)
    .route("/", meta)
    .route("/", events)
    .onError((err, c) => {
        // TEST: test this somehow (idk what could cause the fauilure here).
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

// this shouldnt normally exist in prod but its for school

app.get(
    "/openapi",
    openAPISpecs(app, {
        documentation: {
            info: {
                title: "Quizzy API",
                description: `## A Quizzy API dokumentációja

### Megjegyzés a hitelesítésről
A Swagger UI 'Try it out' funkciója nem támogatja a sütik automatikus küldését.
Szerezd meg a sütit a /login végponton keresztül, majd használd a böngésző fejlesztői eszközeit vagy
egy külső kliensprogramot (például Postman, curl), hogy a sütit beilleszd a kérésekbe.`,
                version: "1.0.0",
            },
            components: {
                securitySchemes: {
                    ApiKeyAuth: {
                        // Matches the name used in 'security' array
                        type: "apiKey",
                        in: "header",
                        name: "X-Api-Key", // The actual header name
                        description:
                            "Adminisztrátori hozzáféréshez szükséges API kulcs.",
                    },
                    CookieAuth: {
                        // For JWT cookie
                        type: "apiKey", // Using apiKey type for cookie auth representation
                        in: "cookie",
                        name: GLOBALS.ACCESS_COOKIE_NAME, // Your cookie name
                        description: "Session hitelesítési süti (JWT).",
                    },
                    BearerAuth: {
                        // For WS secret
                        type: "http",
                        scheme: "bearer",
                        description:
                            "WebSocket-Event hitelesítéshez használt Bearer token (WS_SECRET).",
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

app.route("/", admin);

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

export default {
    port: port,
    fetch: app.fetch,
};
