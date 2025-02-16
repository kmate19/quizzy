import { Hono } from "hono";
import getLanguagesHandlers from "@/controllers/meta/get-languages";
import getTagsHandlers from "@/controllers/meta/get-tags";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";

const meta = new Hono().basePath("/meta")
    .get("/tags",
        describeRoute({
            description: "Get all tags",
            responses: {
                200: {
                    description: "Success",
                    content: {
                        "application/json": {
                            schema: resolver(
                                z.object({ name: z.string() }).array()
                            )
                        },
                    },
                }
            }
        })
        , ...getTagsHandlers)
    .get("/languages", ...getLanguagesHandlers)

export default meta;
