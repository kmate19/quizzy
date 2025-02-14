import { Hono } from "hono";
import { z } from "zod";
import { zv } from "@/middlewares/zv";
import verifyHandler from "@/controllers/auth/verify";
import registerHandler from "@/controllers/auth/register";
import loginHandler from "@/controllers/auth/login";
import logoutHandler from "@/controllers/auth/logout";
import checkJwt from "@/middlewares/check-jwt";
import forgotPasswordHandler from "@/controllers/auth/forgot-password";
import forgotPassActivateHandler from "@/controllers/auth/forgot-password-activate";
import changePasswordHandler from "@/controllers/auth/change-password";

const auth = new Hono().basePath("/auth")
    .post("/register", ...registerHandler)
    .post("/login", ...loginHandler)
    .get("/logout", ...logoutHandler)
    .post("/forgotpassword", ...forgotPasswordHandler)
    .post("/changepassword", ...changePasswordHandler)
    .get("/forgotpassactivate/:token", ...forgotPassActivateHandler)
    .get("/verify/:emailHash", ...verifyHandler)
    .get("/authed", zv('query', z.object({ role: z.string().optional() })), async (c) => {
        // TEST: test this (also this is a bit of a mess)
        const { role } = c.req.valid('query');
        const middleware = checkJwt(role)

        // @ts-ignore not sending in next
        const res = await middleware(c)

        if (!res) return c.json({ message: "user is authed" }, 200);
        else return res;
    })

export default auth;
