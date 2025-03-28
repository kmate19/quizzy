// ./src/openapi/userprofile-openapi.ts

import { ApiResponseSchema } from "@/utils/schemas/zod-schemas";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";

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

export const getUserprofileDesc = describeRoute({
    tags: ["User Profile"],
    description:
        "Get the comprehensive profile data for the currently authenticated user, including email, username, status, profile picture, stats, friendships (sent/received), and roles. Requires user authentication.",
    responses: {
        200: {
            description:
                "Success - Returns the authenticated user's profile data.",
            content: {
                "application/json": {
                    // Schema likely ApiResponse with data: User (with relations loaded)
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
                "Not Found - The authenticated user could not be found (should theoretically not happen if token is valid).",
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

export const postProfilePictureDesc = describeRoute({
    tags: ["User Profile"],
    description:
        "Upload or update the profile picture for the currently authenticated user. The image will be processed (resized/converted to JPEG). Max file size 1MB. Requires user authentication.",
    request: {
        body: {
            content: {
                "image/*": {
                    // Accepts various image types
                    schema: {
                        type: "string",
                        format: "binary",
                        description: "The image file to upload.",
                    },
                },
            },
            description: "Image file (max 1MB).",
            required: true,
        },
    },
    responses: {
        200: {
            description: "Success - Profile picture updated successfully.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description:
                "Bad Request - Invalid file type (not an image), file too large (> 1MB), or error processing the image.",
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

export const getUserProfileByIdDesc = describeRoute({
    tags: ["User Profile"],
    description:
        "Get publicly available profile data for a specific user by their UUID, including username, creation date, activity status, profile picture, stats, and roles. Supports authentication via JWT cookie or API Key.",
    request: {
        params: userIdParam,
    },
    responses: {
        200: {
            description:
                "Success - Returns the public profile data for the specified user.",
            content: {
                "application/json": {
                    // Schema likely ApiResponse with data: User (subset of fields + relations)
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        404: {
            description: "Not Found - No user found with the specified UUID.",
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
