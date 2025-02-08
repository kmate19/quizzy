import { Hono } from "hono";
import verifyHandler from "@/controllers/auth/verify";
import registerHandler from "@/controllers/auth/register";
import loginHandler from "@/controllers/auth/login";
import logoutHandler from "@/controllers/auth/logout";
import checkJwt from "@/middlewares/check-jwt";
import { z } from "zod";
import { zv } from "@/middlewares/zv";

const auth = new Hono().basePath("/auth")
    .post("/register", ...registerHandler)
    .post("/login", ...loginHandler)
    .get("/logout", ...logoutHandler)
    .get("/verify/:emailHash", ...verifyHandler)
    .get("/authed", zv('query', z.object({ role: z.string().optional() })), async (c) => {
        // TEST: test this (also this is a bit of a mess)
        const { role } = c.req.valid('query');
        const middleware = checkJwt(role)
        // @ts-ignore not sending in next
        const res = await middleware(c)
        if (!res) return c.json({ message: "user is authed" });
        else return res;
    })

export default auth;
