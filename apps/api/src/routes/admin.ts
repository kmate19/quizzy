import check_apikey from "@/middlewares/check-apikey";
import { Hono } from "hono/tiny";


const admin = new Hono().basePath("/admin")
    .use(check_apikey)
    .get('/', async (c) => {
        return c.json({ message: "admin" })
    })
export default admin
