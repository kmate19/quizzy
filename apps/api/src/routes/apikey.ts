import { Hono } from "hono";
import createHandler from "@/controllers/apikey/create";
import deleteHandler from "@/controllers/apikey/delete";
import listHandler from "@/controllers/apikey/list";
import { describeRoute } from "hono-openapi";
import { z } from "zod";
import { resolver } from "hono-openapi/zod";

const createApiKeyDesc = describeRoute({
    description: "Create a new API key (admin only)",
    responses: {
        200: {
            description: "Success - API key created",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({
                            message: z.literal("API key created, you will only see the full key once, so save it"),
                            data: z.string()
                        })
                    )
                }
            },
        },
        403: {
            description: "Forbidden - maximum number of API keys reached",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({
                            message: z.literal("You have reached the maximum number of API keys"),
                            error: z.object({
                                message: z.literal("You have reached the maximum number of API keys"),
                                case: z.literal("forbidden")
                            })
                        })
                    )
                }
            },
        }
    }
});

const listApiKeysDesc = describeRoute({
    description: "List all API keys for the authenticated admin user",
    responses: {
        200: {
            description: "Success - API keys retrieved",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({
                            message: z.literal("API keys found"),
                            data: z.array(z.object({
                                key: z.string(), // Partial key (masked)
                                created_at: z.string(),
                            }))
                        })
                    )
                }
            },
        },
        404: {
            description: "Not Found - No API keys available",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({
                            message: z.literal("No API keys found"),
                            error: z.object({
                                message: z.literal("No API keys found"),
                                case: z.literal("not_found")
                            })
                        })
                    )
                }
            },
        }
    }
});

const deleteApiKeyDesc = describeRoute({
    description: "Delete an API key for the authenticated admin user",
    responses: {
        200: {
            description: "Success - API key deleted",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({
                            message: z.literal("API key deleted")
                        })
                    )
                }
            },
        },
        404: {
            description: "Not Found - API key not found",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({
                            message: z.literal("API key not found"),
                            error: z.object({
                                message: z.literal("API key not found"),
                                case: z.literal("not_found")
                            })
                        })
                    )
                }
            },
        }
    }
});

const apikey = new Hono().basePath("/apikey")
    .post("/create", createApiKeyDesc, ...createHandler)
    .get("/list", listApiKeysDesc, ...listHandler)
    .delete("/delete/:id", deleteApiKeyDesc, ...deleteHandler)

export default apikey;
