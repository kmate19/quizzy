// ./src/openapi/events-openapi.ts

import {
    ApiResponseSchema,
    quizFinishedSchema,
} from "@/utils/schemas/zod-schemas";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";

export const quizFinishedDesc = describeRoute({
    tags: ["Events"],
    security: [{ BearerAuth: [] }], // Indicate API Key is used, maybe define globally? Or BearerAuth for WS secret
    description: `Record the results of a finished quiz for a user. Updates the quiz's play count and the user's statistics (plays, placements for multi, correct/wrong answers).
    Requires authentication via a secret token passed in the 'Authorization: Bearer <token>' header (matching WS_SECRET env var). Intended for internal/service-to-service use.`,
    request: {
        body: {
            content: {
                "application/json": {
                    schema: resolver(quizFinishedSchema),
                },
            },
            description:
                "Details of the finished quiz, including user ID, quiz ID, type (solo/multi), and metadata (placement, answer counts).",
            required: true,
        },
    },
    responses: {
        200: {
            description: "Success - Event processed and statistics updated.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description:
                "Bad Request - Invalid request body format or error updating database records.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        401: {
            description:
                "Unauthorized - Missing or invalid authorization token (Bearer token does not match WS_SECRET).",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true }) // Middleware likely returns plain 401
                    ),
                },
            },
        },
    },
});
