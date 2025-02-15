import { Hono } from "hono";
import getLanguagesHandlers from "@/controllers/meta/get-languages";
import getTagsHandlers from "@/controllers/meta/get-tags";

const meta = new Hono().basePath("/meta")
    .get("/tags", ...getTagsHandlers)
    .get("/languages", ...getLanguagesHandlers)

export default meta;
