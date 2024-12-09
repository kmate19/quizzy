import db from "@/db/index.ts";
import { LoginUserSchema, RegisterUserSchema, usersTable, type User } from "@/db/schemas/usersSchema.ts";
import { userTokensTable } from "@/db/schemas/userTokensSchema.ts";
import postgresErrorHandler from "@/utils/postgresErrorHandler.ts";
import sendEmail from "@/utils/sendEmail.ts";
import { zValidator } from "@hono/zod-validator";
import { eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import type { CookieOptions } from "hono/utils/cookie";

const cookieOpts: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    domain: Bun.env.DOMAIN,
    maxAge: 60 * 60 * 24 * 30,
}

const auth = new Hono().basePath("/auth")

    .post("/register", zValidator('json', RegisterUserSchema), async (c) => {
        const registerUserData = c.req.valid('json')

        // PERF: Probably would be better to check if the user is duplicate first and maybe use worker threads
        try {
            registerUserData.password = await Bun.password.hash(registerUserData.password);
        } catch (error) {
            c.status(500);
            return;
        }

        try {
            await db.insert(usersTable).values(registerUserData);
        } catch (error) {
            const err = postgresErrorHandler(error as Error & { code: string });

            if (err.type === "dup") {
                c.status(400);
                return c.json({ message: `${err.columnName} is already taken!` });
            } else {
                c.status(500);
                return;
            }
        }

        // NOTE: This should use a normal smtp server in the future, not gmail also workers
        await sendEmail(registerUserData.email);

        return c.redirect("/login");
    })

    .post("/login", zValidator('json', LoginUserSchema), async (c) => {
        const loginUserData = c.req.valid('json');

        let user;
        try {
            user = await db.select().from(usersTable).where(or(
                eq(usersTable.username, loginUserData.username_or_email),
                eq(usersTable.email, loginUserData.username_or_email)
            ));
            if (user.length > 1) {
                throw new Error("Multiple users found!");
            }
            user = user[0];
        } catch (error) {
            const err = postgresErrorHandler(error as Error & { code: string });

            c.status(500);
            return;
        }

        switch (user.auth_status) {
            //case "pending":
            //    c.status(400);
            //    return c.json({ message: "Account not verified! Please check your inbox for the verification email!" });
            case "blocked":
                c.status(400);
                return c.json({ message: "Your account can't be accessed at this time. Please contant an administrator." });
        }

        if (!await Bun.password.verify(loginUserData.password, user.password)) {
            c.status(400);
            return c.json({ message: "Invalid password!" });
        }

        const refreshTokenPayload = { userId: user.id, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 };
        // FIX: fix env later
        const refreshToken = await sign(refreshTokenPayload, Bun.env.REFRESH_JWT_SECRET! || "asd");

        try {
            await db.insert(userTokensTable).values({ user_id: user.id, refresh_token: refreshToken });
        } catch (error) {
            c.status(500);
            return;
        }

        const accessTokenPayload = { userId: user.id, exp: Math.floor(Date.now() / 1000) + 60 * 10 };
        // FIX: fix env later
        const accessToken = await sign(accessTokenPayload, Bun.env.ACCESS_JWT_SECRET! || "asdf")

        setCookie(c, "321vmnf", accessToken, cookieOpts);

        return c.json({ message: "Logged in!" });
    })

    .post("/logout", async (c) => {
        return c.status(404)
    })

    .post("/refresh_token", async (c) => {
        return c.status(404)
    });

export default auth;
