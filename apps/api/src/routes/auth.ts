import { Hono } from "hono";
import verifyHandler from "@/controllers/auth/verify.ts";
import registerHandler from "@/controllers/auth/register.ts";
import loginHandler from "@/controllers/auth/login.ts";
import logoutHandler from "@/controllers/auth/logout.ts";

const auth = new Hono().basePath("/auth")
    .post("/register", ...registerHandler)
    .get("/verify/:emailHash", ...verifyHandler)
    .post("/login", ...loginHandler)
    .get("/logout", ...logoutHandler)

export default auth;
