import { resolver } from "hono-openapi/zod";
import { describeRoute } from "hono-openapi";
import { ApiResponseSchema } from "@/utils/schemas/zod-schemas";

export const publishQuizDesc = describeRoute({
    description:
        "Publish a new quiz with cards, optional languages and tags for the authenticated user",
    responses: {
        201: {
            description: "Success - Quiz published",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description: "Bad Request - Invalid data provided",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
    },
});

export const getQuizzesDesc = describeRoute({
    description:
        "Fetch published quizzes with pagination, including associated user, tags, cards and languages",
    responses: {
        200: {
            description: "Success - Quizzes fetched",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description: "Bad Request - Invalid query parameters",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
    },
});

export const getOwnQuizzesDesc = describeRoute({
    description:
        "Fetches all owned of the authenticated user quizzes with including associated cards, tags, and languages",
    responses: {
        200: {
            description: "Success - Quizzes fetched",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description: "Bad Request - Invalid query parameters",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
    },
});
