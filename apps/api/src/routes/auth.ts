import db from "@/db/index.ts";
import { LoginUserSchema, RegisterUserSchema, usersTable } from "@/db/schemas/usersSchema.ts";
import { userTokensTable } from "@/db/schemas/userTokensSchema.ts";
import postgresErrorHandler from "@/utils/db/postgresErrorHandler.ts";
import { zValidator } from "@hono/zod-validator";
import { eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";
import { z } from "zod";
import ENV from "@/config/env.ts";
import GLOBALS from "@/config/globals.ts";
import getOneStrict from "@/utils/db/getOneStrict.ts";
import { userRolesTable } from "@/db/schemas/userRolesSchema.ts";
import { rolesTable } from "@/db/schemas/rolesSchema.ts";

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

        let insertResult;
        try {
            await db.transaction(async (tx) => {
                insertResult = getOneStrict(await tx.insert(usersTable).values(registerUserData).returning({ id: usersTable.id }));
                const roleId = getOneStrict(await tx.select({ id: rolesTable.id }).from(rolesTable).where(eq(rolesTable.name, "default")))
                await tx.insert(userRolesTable).values({
                    user_id: insertResult.id,
                    role_id: roleId.id
                });
            });
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

        const emailToken = new Bun.CryptoHasher("sha1").update(registerUserData.email).digest("hex");

        try {
            // TODO: make cron job to delete expired tokens
            await db.insert(userTokensTable).values({ user_id: insertResult.id, token: emailToken, token_type: "email", expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24) });
        } catch (error) {
            c.status(500);
            return;
        }


        // NOTE: Worker paths need to be from the CWD of the running script, not relative to the file that imports it XD!
        // also workers silently throw errors which dont get propogated to the main thread, so we need to event listener haha
        // actually this still doesnt work since bun docs are wrong, after compiling the file extension becomes .js so thats why it cant find the file in prod
        // ALSO THE RELATIVE PATHS NEED TO BE CHANGED SINCE FOLDER STRUCTURE CHANGES AFTER COMPILATION 
        // (why am i even compiling if theres one more issue because of this, im refactoring)
        const workerExtension = ENV.NODE_ENV() === "production" ? ".js" : ".ts";
        const workerRelativePath = ENV.NODE_ENV() === "production" ? "./" : "../";
        const worker = new Worker(new URL(workerRelativePath + "workers/emailWorker" + workerExtension, import.meta.url).href);
        worker.onerror = (e) => {
            console.error(e);
        };
        worker.postMessage({ email: registerUserData.email, emailToken });

        return c.redirect("/login");
    })

    .get("/verify/:emailHash", zValidator("param", z.object({ emailHash: z.string() })), async (c) => {
        const emailHash = c.req.valid("param").emailHash;

        try {
            const userAndToken = getOneStrict(await db.select()
                .from(usersTable)
                .leftJoin(userTokensTable, eq(userTokensTable.user_id, usersTable.id))
                .where(eq(userTokensTable.token, emailHash)));

            //const a = await db.query.usersTable.findFirst({
            //    with: {
            //        tokens: {
            //            where: eq(userTokensTable.token, emailHash)
            //        }
            //    }
            //})

            await db.update(usersTable).set({ auth_status: "active" }).where(eq(usersTable.id, userAndToken.users.id));
            await db.delete(userTokensTable).where(eq(userTokensTable.id, userAndToken.user_tokens!.id));

        } catch (error) {
            console.log(error)
            // NOTE: inform frontend that the login page needs a path param to take if the email verification failed
            return c.redirect("/login/e=1");
        }

        return c.redirect("/login");
    })

    .post("/login", zValidator('json', LoginUserSchema), async (c) => {
        const loginUserData = c.req.valid('json');
        const accessCookie = getCookie(c, GLOBALS.ACCESS_COOKIE_NAME);

        // NOTE: Keep an eye on this in the future so its not an infinite redirect loop
        if (accessCookie) {
            console.log("user already logged in");
            return c.redirect("/");
        }

        let user;
        try {
            user = getOneStrict(await db.select().from(usersTable).where(or(
                eq(usersTable.username, loginUserData.username_or_email),
                eq(usersTable.email, loginUserData.username_or_email)
            )));

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

        try {
            const userToken = getOneStrict(await db.insert(userTokensTable)
                .values({
                    user_id: user.id,
                    token: refreshToken,
                    token_type: "refresh", expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
                })
                .returning({ id: userTokensTable.id }));

            const accessTokenPayload = { userId: user.id, forId: userToken.id, exp: Math.floor(Date.now() / 1000) + 60 * 30 };
            const accessToken = await sign(accessTokenPayload, ENV.ACCESS_JWT_SECRET())
            setCookie(c, GLOBALS.ACCESS_COOKIE_NAME, accessToken, GLOBALS.COOKIE_OPTS);

        } catch (error) {
            c.status(500);
            return;
        }

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
