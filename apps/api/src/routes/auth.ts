import { Hono } from "hono";
import verifyHandler from "@/controllers/auth/verify";
import registerHandler from "@/controllers/auth/register";
import loginHandler from "@/controllers/auth/login";
import logoutHandler from "@/controllers/auth/logout";
import checkJwt from "@/middlewares/checkJwt";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const auth = new Hono().basePath("/auth")
    .post("/register", ...registerHandler)
    .post("/login", ...loginHandler)
    .get("/logout", ...logoutHandler)
    .get("/verify/:emailHash", ...verifyHandler)
    .get("/authed", zValidator('query', z.object({ role: z.string().optional() })), async (c) => {
        const { role } = c.req.valid('query');
        const middleware = checkJwt(role)
        // @ts-ignore not sending in next
        const res = await middleware(c)
        if (!res) return c.json({ message: "user is authed" });
        else return res;
    })

export default auth;
