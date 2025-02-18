import { ApiResponseSchema } from "@/utils/schemas/zod-schemas";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";

export const getUserprofileDesc = describeRoute({
    description: "Get user profile data",
    responses: {
        200: {
            description: "Success - list of all of the user's public/own data",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
    },
});
