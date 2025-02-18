import { Hono } from "hono";
import createHandler from "@/controllers/apikey/create";
import deleteHandler from "@/controllers/apikey/delete";
import listHandler from "@/controllers/apikey/list";

const apikey = new Hono().basePath("/apikey")
    .post("/create", ...createHandler)
    .get("/list", ...listHandler)
    .delete("/delete/:id", ...deleteHandler)

export default apikey;
