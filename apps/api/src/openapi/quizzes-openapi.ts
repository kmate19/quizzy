// ./src/openapi/quizzes-openapi.ts

import { resolver } from "hono-openapi/zod";
import { describeRoute } from "hono-openapi";
import {
    ApiResponseSchema,
    editQuizSchema,
    paginationSchema,
    publishQuizSchema,
    searchQuerySchema,
} from "@/utils/schemas/zod-schemas";

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

const userIdParam = {
    type: "object",
    properties: {
        userId: {
            type: "string",
            format: "uuid",
            description: "The UUID of the user.",
        },
    },
    required: ["userId"],
};

export const publishQuizDesc = describeRoute({
    tags: ["Quizzes"],
    description:
        "Publish a new quiz, including its details (title, description, status, banner image), cards (questions, answers, images), associated language ISO codes, and tag names. Requires user authentication.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: resolver(publishQuizSchema),
                },
            },
            description:
                "The complete quiz data including quiz info, cards, languages, and tags. Images should be base64 encoded.",
            required: true,
        },
    },
    responses: {
        201: {
            description:
                "Success - Quiz created successfully. Returns the new quiz UUID.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema), // Data contains { id: string }
                },
            },
        },
        400: {
            description:
                "Bad Request - Invalid data provided (e.g., validation errors, image format/size incorrect, non-existent language/tag, too many quizzes/cards).",
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
    },
});

export const editQuizDesc = describeRoute({
    tags: ["Quizzes"],
    description:
        "Edit an existing quiz owned by the authenticated user. Allows modification of quiz details, cards, languages, and tags. Requires user authentication.",
    request: {
        params: uuidParam,
        body: {
            content: {
                "application/json": {
                    schema: resolver(editQuizSchema),
                },
            },
            description:
                "The quiz fields to update. Only provided fields will be changed. Images should be base64 encoded.",
            required: true,
        },
    },
    responses: {
        200: {
            description:
                "Success - Quiz updated successfully. Returns the quiz UUID.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema), // Data contains { id: string }
                },
            },
        },
        400: {
            description:
                "Bad Request - Invalid data provided (e.g., validation errors, image format/size incorrect, non-existent language/tag, too many cards, no changes detected).",
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
        404: {
            description:
                "Not Found - The specified quiz was not found or is not owned by the user.",
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
    tags: ["Quizzes"],
    description:
        "Fetch a paginated list of publicly 'published' quizzes, including associated user (username only), tags, and languages. Supports authentication via JWT cookie or API Key.",
    request: {
        query: resolver(paginationSchema),
    },
    responses: {
        200: {
            description:
                "Success - A list of published quizzes and the total count.",
            content: {
                "application/json": {
                    // Schema likely ApiResponse with data: { quizzes: Quiz[], totalCount: number }
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description:
                "Bad Request - Invalid query parameters for pagination.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        // 401/403 might occur depending on apikey_or_jwt implementation if *neither* is valid
    },
});

export const getOwnQuizzesDesc = describeRoute({
    tags: ["Quizzes"],
    description:
        "Fetches all quizzes owned by the authenticated user, regardless of their status (draft, published, etc.), including associated tags and languages. Requires user authentication.",
    responses: {
        200: {
            description: "Success - A list of all quizzes owned by the user.",
            content: {
                "application/json": {
                    // Schema likely ApiResponse with data: Quiz[]
                    schema: resolver(ApiResponseSchema),
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
        // 400 unlikely unless pagination added later
    },
});

export const getQuizByIdDesc = describeRoute({
    tags: ["Quizzes"],
    description:
        "Fetch a single 'published' quiz by its UUID, including full details: user info (id, username, picture, status), cards, tags, and languages. Supports authentication via JWT cookie or API Key.",
    request: {
        params: uuidParam,
    },
    responses: {
        200: {
            description: "Success - The requested published quiz details.",
            content: {
                "application/json": {
                    // Schema likely ApiResponse with data: Quiz (with relations loaded)
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        404: {
            description:
                "Not Found - The quiz with the specified UUID was not found or is not 'published'.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        // 401/403 might occur depending on apikey_or_jwt
    },
});

export const getOwnQuizByIdDesc = describeRoute({
    tags: ["Quizzes"],
    description:
        "Fetch a single quiz owned by the authenticated user by its UUID, regardless of status, including full details: cards, tags, and languages. Requires user authentication.",
    request: {
        params: uuidParam,
    },
    responses: {
        200: {
            description:
                "Success - The requested quiz details owned by the user.",
            content: {
                "application/json": {
                    // Schema likely ApiResponse with data: Quiz (with relations loaded)
                    schema: resolver(ApiResponseSchema),
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
        404: {
            description:
                "Not Found - The quiz with the specified UUID was not found or is not owned by the authenticated user.",
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

export const getQuizzesByUserIdDesc = describeRoute({
    tags: ["Quizzes"],
    description:
        "Fetch all 'published' quizzes created by a specific user, identified by their UUID. Includes associated tags and languages. Supports authentication via JWT cookie or API Key.",
    request: {
        params: userIdParam,
    },
    responses: {
        200: {
            description:
                "Success - A list of published quizzes created by the specified user.",
            content: {
                "application/json": {
                    // Schema likely ApiResponse with data: Quiz[] (with relations)
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        404: {
            description:
                "Not Found - The user was not found (though the response might be an empty list).",
            // Controller returns 200 with empty list, so 404 may not happen here unless user UUID format is wrong
        },
        // 401/403 might occur depending on apikey_or_jwt
    },
});

export const deleteQuizDesc = describeRoute({
    tags: ["Quizzes"],
    description:
        "Delete a quiz owned by the authenticated user. Requires user authentication.",
    request: {
        params: uuidParam,
    },
    responses: {
        200: {
            description: "Success - Quiz deleted successfully.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
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
        404: {
            description:
                "Not Found - The quiz was not found or is not owned by the user.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true }) // Controller currently returns 404 text
                    ),
                },
            },
        },
    },
});

export const searchQuizzesDesc = describeRoute({
    tags: ["Quizzes"],
    description: `Search for 'published' quizzes based on a text query (title/description), tag names, and language ISO codes. Supports pagination and strict/non-strict matching for tags/languages.
    - Text query uses PostgreSQL's \`ts_vector\` and \`plainto_tsquery\` for full-text search, plus \`similarity\` for trigram matching on the title.
    - Tag/Language filters can be single strings or arrays.
    - 'strict=true': Quiz must have *all* specified tags/languages and *only* those tags/languages.
    - 'strict=false' (default): Quiz must have *at least one* of the specified tags/languages.
    - If multiple filters (query, tags, languages) are provided, 'strict=true' requires all conditions to match (AND), while 'strict=false' requires at least one condition to match (OR).
    Supports authentication via JWT cookie or API Key.`,
    request: {
        query: resolver(searchQuerySchema),
    },
    responses: {
        200: {
            description:
                "Success - Returns a list of matching published quizzes and the total count.",
            content: {
                "application/json": {
                    // Schema likely ApiResponse with data: { quizzes: Quiz[], totalCount: number }
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description:
                "Bad Request - Invalid query parameters (e.g., pagination format).",
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
                "Not Found - A specified tag name or language ISO code does not exist.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        // 401/403 might occur depending on apikey_or_jwt
    },
});
