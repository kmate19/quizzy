// ./src/openapi/apikey-openapi.ts

import { ApiResponseSchema } from "@/utils/schemas/zod-schemas";
import { postApiKeySchema } from "@/db/schemas";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";

export const createApiKeyDesc = describeRoute({
    tags: ["API Keys"],
    description:
        "Create a new API key for the authenticated admin user. The full API key is returned only once upon creation. Requires admin role.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: resolver(postApiKeySchema),
                },
            },
            description:
                "Details for the new API key, including description and expiry date.",
            required: true,
        },
    },
    responses: {
        200: {
            description:
                "Success - API key created. The response data contains the full key (save it securely).",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema), // Data contains the full string API key
                },
            },
        },
        400: {
            description:
                "Bad Request - Invalid input format (e.g., invalid date).",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        401: {
            description: "Unauthorized - User is not logged in.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        403: {
            description:
                "Forbidden - The user does not have the 'admin' role or has reached the maximum number of allowed active API keys.",
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
    tags: ["API Keys"],
    description:
        "List all API keys belonging to the authenticated admin user. Keys are returned masked (only first/last few characters shown). Requires admin role.",
    responses: {
        200: {
            description:
                "Success - API keys retrieved. The response data contains an array of key objects (masked key, description, creation/expiry dates, user-specific ID).",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema), // Data contains array of masked key objects
                },
            },
        },
        401: {
            description: "Unauthorized - User is not logged in.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        403: {
            description: "Forbidden - The user does not have the 'admin' role.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        404: {
            description: "Not Found - The user currently has no API keys.",
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
    tags: ["API Keys"],
    description:
        "Delete a specific API key belonging to the authenticated admin user, identified by its user-specific index (id_by_user). Requires admin role.",
    request: {
        params: {
            type: "object",
            properties: {
                id: {
                    type: "string",
                    pattern: "^\\d+$",
                    description:
                        "The user-specific index (id_by_user) of the API key to delete.",
                    example: "0",
                },
            },
            required: ["id"],
        },
    },
    responses: {
        200: {
            description: "Success - API key deleted successfully.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description:
                "Bad Request - Invalid ID format (must be numeric string).",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        401: {
            description: "Unauthorized - User is not logged in.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        403: {
            description: "Forbidden - The user does not have the 'admin' role.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        404: {
            description:
                "Not Found - No API key found with the specified user-specific index for this user.",
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
