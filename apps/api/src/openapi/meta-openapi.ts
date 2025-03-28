// ./src/openapi/meta-openapi.ts

import { ApiResponseSchema } from "@/utils/schemas/zod-schemas";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";

export const getTagsDesc = describeRoute({
    tags: ["Metadata"],
    description:
        "Get a list of all available tags that can be associated with quizzes. Supports authentication via JWT cookie or API Key.",
    responses: {
        200: {
            description:
                "Success - Returns an array of tag objects, each containing the tag name.",
            content: {
                "application/json": {
                    // Schema likely Tag[] or ApiResponse with data: Tag[]
                    schema: resolver(ApiResponseSchema), // Assuming controller wraps in ApiResponse
                },
            },
        },
        // 401/403 might occur depending on apikey_or_jwt
    },
});

export const getLanguagesDesc = describeRoute({
    tags: ["Metadata"],
    description:
        "Get a list of all available languages that quizzes can be associated with, including their name, ISO code, icon, and support level. Supports authentication via JWT cookie or API Key.",
    responses: {
        200: {
            description: "Success - Returns an array of language objects.",
            content: {
                "application/json": {
                    // Schema likely Language[] or ApiResponse with data: Language[]
                    schema: resolver(ApiResponseSchema), // Assuming controller wraps in ApiResponse
                },
            },
        },
        // 401/403 might occur depending on apikey_or_jwt
    },
});
