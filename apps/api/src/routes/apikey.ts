import { Hono } from "hono";
import createHandler from "@/controllers/apikey/create";
import deleteHandler from "@/controllers/apikey/delete";
import listHandler from "@/controllers/apikey/list";
import { describeRoute } from "hono-openapi";
import { z } from "zod";
import { resolver } from "hono-openapi/zod";

console.error(...createHandler)

const apikey = new Hono().basePath("/apikey")
    .post("/create",
        describeRoute({
            description: "Create an API key",
            responses: {
                200: {
                    description: "Success - apikey created",
                    content: {
                        "application/json": {
                            schema: resolver(z.object({ message: z.string(), data: z.string() })),
                        },
                    },
                },
            }
        }), ...createHandler)

    .get("/list",
        describeRoute({
            description: "List own API keys",
            responses: {
                200: {
                    description: "Success - list of apikeys (trunctated)",
                    content: {
                        "application/json": {
                            schema: resolver(z.object({
                                message: z.string(), data: z.object({
                                    description: z.string().nullable(),
                                    key: z.string(),
                                    created_at: z.string(),
                                    id_by_user: z.number(),
                                    expires_at: z.string().datetime(),
                                }).array()
                            })),
                        },
                    },
                },
            }
        }), ...listHandler)

    .delete("/delete/:id",
        describeRoute({
            description: "Delete an apikey",
            responses: {
                200: {
                    description: "Success - apikey deleted",
                    content: {
                        "application/json": {
                            schema: resolver(z.object({ message: z.string() })),
                        },
                    },
                },
            }
        }), ...deleteHandler)

export default apikey;
