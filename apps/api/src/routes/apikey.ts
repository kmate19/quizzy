import createHandler from "@/controllers/apikey/create.ts";
import deleteHandler from "@/controllers/apikey/delete.ts";
import listHandler from "@/controllers/apikey/list.ts";
import { Hono } from "hono";


const apikey = new Hono().basePath("/apikey")
    .post("/create", ...createHandler)
    .get("/list", ...listHandler)
    .delete("/delete/:id", ...deleteHandler)

export default apikey;
