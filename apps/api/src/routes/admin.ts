import setAuthStatusHandlers from "@/controllers/admin/set-auth-status";
import setRoleHandlers from "@/controllers/admin/set-role";
import { Hono } from "hono/tiny";

const admin = new Hono()
    .basePath("/admin")
    .post("/set/role", ...setRoleHandlers)
    .post("/set/authstatus", ...setAuthStatusHandlers);

export default admin;
