import createHandler from "@/controllers/apikey/create";
import deleteHandler from "@/controllers/apikey/delete";
import listHandler from "@/controllers/apikey/list";
import { Hono } from "hono";


const apikey = new Hono().basePath("/apikey")
    .post("/create", ...createHandler)
    .get("/list", ...listHandler)
    .delete("/delete/:id", ...deleteHandler)

export default apikey;
