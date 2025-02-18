import { ApiResponseSchema } from "@/utils/schemas/zod-schemas";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";

export const createApiKeyDesc = describeRoute({
    description: "Create a new API key (admin only)",
    responses: {
        200: {
            description: "Success - API key created",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        403: {
            description: "Forbidden - maximum number of API keys reached",
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

export const listApiKeysDesc = describeRoute({
    description: "List all API keys for the authenticated admin user",
    responses: {
        200: {
            description: "Success - API keys retrieved",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        404: {
            description: "Not Found - No API keys available",
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

export const deleteApiKeyDesc = describeRoute({
    description: "Delete an API key for the authenticated admin user",
    responses: {
        200: {
            description: "Success - API key deleted",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        404: {
            description: "Not Found - API key not found",
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
