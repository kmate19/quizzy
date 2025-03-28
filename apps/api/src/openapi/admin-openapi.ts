// ./src/openapi/admin-openapi.ts

import {
    ApiResponseSchema,
    paginationSchema,
} from "@/utils/schemas/zod-schemas";
import { authStatusEnum } from "@/db/schemas";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";

const uuidParam = {
    type: "object",
    properties: {
        quizId: {
            type: "string",
            format: "uuid",
            description: "The UUID of the quiz.",
        },
    },
    required: ["quizId"],
};

const apiKeySecurity = [{ ApiKeyAuth: [] }]; // Define globally in OpenAPI setup if preferred

export const setRoleDesc = describeRoute({
    tags: ["Admin"],
    security: apiKeySecurity,
    description:
        "Assign a role to a user. Requires a valid API Key passed in the 'X-Api-Key' header.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        userId: z.string().uuid(),
                        roleName: z.string(),
                    }),
                },
            },
            description: "User UUID and the name of the role to assign.",
            required: true,
        },
    },
    responses: {
        200: {
            description: "Success - Role assigned/updated successfully.",
            content: {
                "application/json": { schema: resolver(ApiResponseSchema) },
            },
        },
        400: {
            description:
                "Bad Request - Invalid input data, role name not found, or database conflict (e.g., user already has role).",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        401: {
            description: "Unauthorized - Missing or invalid API Key.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            }, // Middleware returns 401
        },
    },
});

export const setAuthStatusDesc = describeRoute({
    tags: ["Admin"],
    security: apiKeySecurity,
    description:
        "Set the authentication status ('active', 'pending', 'blocked') for a user. Requires a valid API Key.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        userId: z.string().uuid(),
                        status: z.enum(authStatusEnum.enumValues),
                    }),
                },
            },
            description: "User UUID and the new authentication status.",
            required: true,
        },
    },
    responses: {
        200: {
            description: "Success - User authentication status updated.",
            content: {
                "application/json": { schema: resolver(ApiResponseSchema) },
            },
        },
        400: {
            description: "Bad Request - Invalid input data or database error.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        401: {
            description: "Unauthorized - Missing or invalid API Key.",
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

export const setQuizStatusDesc = describeRoute({
    tags: ["Admin"],
    security: apiKeySecurity,
    description:
        "Approve ('published') or reject ('rejected') a quiz that is currently in the 'requires_review' state. Requires a valid API Key.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        quizId: z.string().uuid(),
                        approve: z.enum(["published", "rejected"]),
                    }),
                },
            },
            description:
                "Quiz UUID and the new status ('published' or 'rejected').",
            required: true,
        },
    },
    responses: {
        200: {
            description: "Success - Quiz status updated.",
            content: {
                "application/json": { schema: resolver(ApiResponseSchema) },
            },
        },
        400: {
            description:
                "Bad Request - Invalid input data, quiz not found, quiz not in 'requires_review' state, or database error.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        401: {
            description: "Unauthorized - Missing or invalid API Key.",
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

export const getAllQuizzesAdminDesc = describeRoute({
    tags: ["Admin"],
    security: apiKeySecurity,
    description:
        "Get a paginated list of *all* quizzes in the system, regardless of status. Includes user, tags, and languages. Requires a valid API Key.",
    request: {
        query: resolver(paginationSchema),
    },
    responses: {
        200: {
            description:
                "Success - Returns a list of all quizzes and the total count.",
            content: {
                "application/json": { schema: resolver(ApiResponseSchema) },
            }, // data: { quizzes: Quiz[], totalCount: number }
        },
        400: {
            description: "Bad Request - Invalid pagination parameters.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        401: {
            description: "Unauthorized - Missing or invalid API Key.",
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

export const getAllUsersAdminDesc = describeRoute({
    tags: ["Admin"],
    security: apiKeySecurity,
    description:
        "Get a paginated list of *all* users in the system, including detailed information like stats, tokens, reviews, API keys, and roles. Requires a valid API Key.",
    request: {
        query: resolver(paginationSchema),
    },
    responses: {
        200: {
            description:
                "Success - Returns a list of all users and the total count.",
            content: {
                "application/json": { schema: resolver(ApiResponseSchema) },
            }, // data: { users: User[], totalCount: number }
        },
        400: {
            description: "Bad Request - Invalid pagination parameters.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        401: {
            description: "Unauthorized - Missing or invalid API Key.",
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

export const authenticateAdminDesc = describeRoute({
    tags: ["Admin"],
    security: apiKeySecurity,
    description:
        "Verify if the provided API Key in the 'X-Api-Key' header is valid and not expired.",
    responses: {
        200: {
            description: "Success - API Key is valid.",
            content: {
                "application/json": { schema: resolver(ApiResponseSchema) },
            },
        },
        401: {
            description: "Unauthorized - Missing or invalid/expired API Key.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            }, // Middleware returns 401
        },
    },
});

export const getQuizByIdAdminDesc = describeRoute({
    tags: ["Admin"],
    // Uses apikey_or_jwt, so either works
    security: [{ ApiKeyAuth: [] }, { CookieAuth: [] }], // Assuming CookieAuth defined for JWT
    description:
        "Fetch a single quiz by its UUID, regardless of its status. Includes full details like user, cards, tags, languages. Requires authentication via API Key or JWT Cookie.",
    request: {
        params: uuidParam,
    },
    responses: {
        200: {
            description:
                "Success - Returns the full details of the requested quiz.",
            content: {
                "application/json": { schema: resolver(ApiResponseSchema) },
            }, // data: Quiz (with relations)
        },
        401: {
            description:
                "Unauthorized - Missing or invalid API Key / JWT Cookie.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        // 403 might occur depending on middleware specifics
        404: {
            description: "Not Found - No quiz found with the specified UUID.",
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
