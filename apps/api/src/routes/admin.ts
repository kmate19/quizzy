import setAuthStatusHandlers from "@/controllers/admin/set-auth-status";
import setRoleHandlers from "@/controllers/admin/set-role";
import check_apikey from "@/middlewares/check-apikey";
import { Hono } from "hono/tiny";

const admin = new Hono()
    .basePath("/admin")
    .post("/set/role", ...setRoleHandlers)
    .post("/set/authstatus", ...setAuthStatusHandlers)
    .get("/authenticate", check_apikey);

export default admin;
