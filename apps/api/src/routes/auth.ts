import { Hono } from "hono";
import verifyHandler from "@/controllers/auth/verify";
import registerHandler from "@/controllers/auth/register";
import loginHandler from "@/controllers/auth/login";
import logoutHandler from "@/controllers/auth/logout";

const auth = new Hono().basePath("/auth")
    .post("/register", ...registerHandler)
    .get("/verify/:emailHash", ...verifyHandler)
    .post("/login", ...loginHandler)
    .get("/logout", ...logoutHandler)

export default auth;
