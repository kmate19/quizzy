import ENV from "@/config/env.ts";
import GLOBALS from "@/config/globals.ts";
import db from "@/db/index.ts";
import { LoginUserSchema, usersTable } from "@/db/schemas/usersSchema.ts";
import { userTokensTable } from "@/db/schemas/userTokensSchema.ts";
import type { QuizzyJWTPAYLOAD } from "@/types.ts";
import getOneStrict from "@/utils/db/getOneStrict.ts";
import postgresErrorHandler from "@/utils/db/postgresErrorHandler.ts";
import { zValidator } from "@hono/zod-validator";
import { eq, or } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";
import { sign } from "hono/jwt";

const loginHandler = GLOBALS.CONTROLLER_FACTORY(zValidator('json', LoginUserSchema), async (c) => {
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
        const userRefreshToken = getOneStrict(await db.insert(userTokensTable)
            .values({
                user_id: user.id,
                token: refreshToken,
                token_type: "refresh", expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
            })
            .returning({ id: userTokensTable.id }));

        const accessTokenPayload: QuizzyJWTPAYLOAD = {
            userId: user.id,
            refreshTokenId: userRefreshToken.id,
            exp: Math.floor(Date.now() / 1000) + 60 * 30
        }

        const accessToken = await sign(accessTokenPayload, ENV.ACCESS_JWT_SECRET())
        setCookie(c, GLOBALS.ACCESS_COOKIE_NAME, accessToken, GLOBALS.COOKIE_OPTS);

    } catch (error) {
        c.status(500);
        return;
    }

    return c.redirect("/");
})

export default loginHandler;
