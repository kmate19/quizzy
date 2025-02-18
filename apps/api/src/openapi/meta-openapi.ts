import { ApiResponseSchema } from "@/utils/schemas/zod-schemas";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";

export const getTagsDesc = describeRoute({
    description: "Get all tags",
    responses: {
        200: {
            description: "Success - list of tags",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
    },
});

export const getLanguagesDesc = describeRoute({
    description: "Get all languages",
    responses: {
        200: {
            description: "Success - list of languages",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
    },
});
