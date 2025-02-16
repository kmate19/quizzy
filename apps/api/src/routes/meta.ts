import { Hono } from "hono";
import getLanguagesHandlers from "@/controllers/meta/get-languages";
import getTagsHandlers from "@/controllers/meta/get-tags";
import { getLanguagesDesc, getTagsDesc } from "@/openapi/meta-openapi";

const meta = new Hono()
    .basePath("/meta")
    .get("/tags", getTagsDesc, ...getTagsHandlers)
    .get("/languages", getLanguagesDesc, ...getLanguagesHandlers);

export default meta;
