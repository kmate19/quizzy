import { Hono } from "hono";
import createHandler from "@/controllers/apikey/create";
import deleteHandler from "@/controllers/apikey/delete";
import listHandler from "@/controllers/apikey/list";
import {
    createApiKeyDesc,
    deleteApiKeyDesc,
    listApiKeysDesc,
} from "@/openapi/apikey-openapi";

const apikey = new Hono()
    .basePath("/apikey")
    .post("/create", createApiKeyDesc, ...createHandler)
    .get("/list", listApiKeysDesc, ...listHandler)
    .delete("/delete/:id", deleteApiKeyDesc, ...deleteHandler);

export default apikey;
