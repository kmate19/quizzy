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
import {
    authedDesc,
    changePasswordDesc,
    forgotPassActivateDesc,
    forgotPasswordDesc,
    loginDesc,
    logoutDesc,
    registerDesc,
    verifyDesc,
} from "@/openapi/auth-openapi";

const auth = new Hono()
    .basePath("/auth")
    .post("/register", registerDesc, ...registerHandler)
    .post("/login", loginDesc, ...loginHandler)
    .get("/logout", logoutDesc, ...logoutHandler)
    .post("/forgotpassword", forgotPasswordDesc, ...forgotPasswordHandler)
    .post("/changepassword", changePasswordDesc, ...changePasswordHandler)
    .get(
        "/forgotpassactivate/:token",
        forgotPassActivateDesc,
        ...forgotPassActivateHandler
    )
    .get("/verify/:emailHash", verifyDesc, ...verifyHandler)
    .get(
        "/authed",
        authedDesc,
        zv("query", z.object({ role: z.string().optional() })),
        async (c) => {
            // TEST: test this (also this is a bit of a mess)
            const { role } = c.req.valid("query");
            const middleware = checkJwt(role);

            // @ts-expect-error not sending in next
            const res = await middleware(c);

            if (!res) {
                return c.json({ message: "user is authed" }, 200);
            } else {
                return res;
            }
        }
    );

export default auth;
