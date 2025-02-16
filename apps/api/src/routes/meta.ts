import { Hono } from "hono";
import getLanguagesHandlers from "@/controllers/meta/get-languages";
import getTagsHandlers from "@/controllers/meta/get-tags";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";

const getTagsDesc = describeRoute({
    description: "Get all tags",
    responses: {
        200: {
            description: "Success - list of tags",
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

const getLanguagesDesc = describeRoute({
    description: "Get all languages",
    responses: {
        200: {
            description: "Success - list of languages",
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

const meta = new Hono().basePath("/meta")
    .get("/tags", getTagsDesc, ...getTagsHandlers)
    .get("/languages", getLanguagesDesc, ...getLanguagesHandlers)

export default meta;
