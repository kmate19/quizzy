import db from "@/db/index.ts";
import { LoginUserSchema, RegisterUserSchema, usersTable } from "@/db/schemas/usersSchema.ts";
import { userTokensTable } from "@/db/schemas/userTokensSchema.ts";
import postgresErrorHandler from "@/utils/db/postgresErrorHandler.ts";
import sendEmail from "@/utils/email/sendEmail.ts";
import { zValidator } from "@hono/zod-validator";
import { eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";
import { z } from "zod";
import ENV from "@/config/env.ts";
import GLOBALS from "@/config/globals.ts";

const auth = new Hono().basePath("/auth")

    .post("/register", zValidator('json', RegisterUserSchema), async (c) => {
        const registerUserData = c.req.valid('json')
        let insertResult;

        // PERF: Probably would be better to check if the user is duplicate first and maybe use worker threads
        try {
            registerUserData.password = await Bun.password.hash(registerUserData.password);
        } catch (error) {
            c.status(500);
            return;
        }

        try {
            insertResult = await db.insert(usersTable).values(registerUserData).returning({ id: usersTable.id });
            insertResult = insertResult[0];
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

        // PERF: not sure how fast this is
        const emailToken = new Bun.CryptoHasher("shake128").update(registerUserData.email).digest("hex");

        try {
            await db.insert(userTokensTable).values({ user_id: insertResult.id, token: emailToken, token_type: "email", expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24) });
        } catch (error) {
            c.status(500);
            return;
        }

        // TODO: This should use a normal smtp server in the future, not gmail also workers
        await sendEmail(registerUserData.email, emailToken);

        return c.redirect("/login");
    })

    .get("/verify/:emailHash", zValidator("param", z.object({ emailHash: z.string() })), async (c) => {
        const emailHash = c.req.valid("param").emailHash;
        let userAndToken;

        try {
            userAndToken = await db.select()
                .from(usersTable)
                .leftJoin(userTokensTable, eq(userTokensTable.user_id, usersTable.id))
                .where(eq(userTokensTable.token, emailHash));

            console.log(userAndToken);
            if (userAndToken.length > 1) {
                throw new Error("Multiple users found!");
            }

            userAndToken = userAndToken[0];

            await db.update(usersTable).set({ auth_status: "active" }).where(eq(usersTable.id, userAndToken.users.id));
            await db.delete(userTokensTable).where(eq(userTokensTable.id, userAndToken.user_tokens!.id));

        } catch (error) {
            console.log(error)
            c.status(500);
            return;
        }

        return c.redirect("/login");
    })

    .post("/login", zValidator('json', LoginUserSchema), async (c) => {
        const loginUserData = c.req.valid('json');
        const accessCookie = getCookie(c, GLOBALS.ACCESS_COOKIE_NAME);

        // NOTE: Keep an eye on this in the future so its not an infinite redirect loop
        if (accessCookie) {
            return c.redirect("/");
        }

        let user;
        try {
            user = await db.select().from(usersTable).where(or(
                eq(usersTable.username, loginUserData.username_or_email),
                eq(usersTable.email, loginUserData.username_or_email)
            ));

            if (user.length > 1 || user.length === 0) {
                throw new Error("Multiple or no users found!");
            }

            user = user[0];
        } catch (error) {
            const err = postgresErrorHandler(error as Error & { code: string });

            c.status(500);
            return;
        }

        if (!await Bun.password.verify(loginUserData.password, user.password)) {
            c.status(400);
            return c.json({ message: "Invalid password!" });
        }

        switch (user.auth_status) {
            case "pending":
                c.status(400);
                return c.json({ message: "Account not verified! Please check your inbox for the verification email!" });
            case "blocked":
                c.status(400);
                return c.json({ message: "Your account can't be accessed at this time. Please contant an administrator." });
        }

        const refreshTokenPayload = { userId: user.id, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 };
        const refreshToken = await sign(refreshTokenPayload, ENV.REFRESH_JWT_SECRET());

        let userToken;
        try {
            userToken = await db.insert(userTokensTable)
                .values({
                    user_id: user.id,
                    token: refreshToken,
                    token_type: "refresh", expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
                })
                .returning({ id: userTokensTable.id });

            userToken = userToken[0];
        } catch (error) {
            c.status(500);
            return;
        }

        const accessTokenPayload = { userId: user.id, forId: userToken.id, exp: Math.floor(Date.now() / 1000) + 30 };
        const accessToken = await sign(accessTokenPayload, ENV.ACCESS_JWT_SECRET())

        setCookie(c, GLOBALS.ACCESS_COOKIE_NAME, accessToken, GLOBALS.COOKIE_OPTS);

        return c.redirect("/");
    })

    .get("/logout", async (c) => {
        const accessCookie = getCookie(c, GLOBALS.ACCESS_COOKIE_NAME);

        if (!accessCookie) {
            return c.redirect("/login");
        }

        const payload = await verify(accessCookie, ENV.ACCESS_JWT_SECRET());

        try {
            await db.delete(userTokensTable).where(eq(userTokensTable.id, payload.forId as number));
        } catch (error) {
            c.status(500);
            return;
        }

        deleteCookie(c, GLOBALS.ACCESS_COOKIE_NAME);

        return c.redirect("/login");
    })

export default auth;
