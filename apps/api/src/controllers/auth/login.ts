import ENV from "@/config/env.ts";
import GLOBALS from "@/config/globals.ts";
import db from "@/db/index.ts";
import { LoginUserSchema, usersTable } from "@/db/schemas/usersSchema.ts";
import { userTokensTable } from "@/db/schemas/userTokensSchema.ts";
import type { QuizzyJWTPAYLOAD } from "@/types.ts";
import { zValidator } from "@hono/zod-validator";
import type { ApiResponse } from "@repo/types";
import { eq, or } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";
import { sign } from "hono/jwt";

const loginHandler = GLOBALS.CONTROLLER_FACTORY(zValidator('json', LoginUserSchema), async (c) => {
    const loginUserData = c.req.valid('json');

    // NOTE: Keep an eye on this in the future so its not an infinite redirect loop
    if (getCookie(c, GLOBALS.ACCESS_COOKIE_NAME)) {
        // user already logged in
        const res = {
            message: 'user is already has a login cookie',
            error: {
                message: 'user cant have a login cookie and try to log in',
                case: "conflict"
            }
        } satisfies ApiResponse;
        return c.json(res, 400);
    }

    const [user] = await db.select().from(usersTable).where(or(
        eq(usersTable.username, loginUserData.username_or_email),
        eq(usersTable.email, loginUserData.username_or_email)
    ));

    if (!user) {
        const res = {
            message: 'user not found',
            error: {
                message: 'user not found',
                case: "not_found",
                field: "username_or_email"
            }
        } satisfies ApiResponse;
        return c.json(res, 404);
    }

    if (!await Bun.password.verify(loginUserData.password, user.password)) {
        const res = {
            message: 'invalid password',
            error: {
                message: 'invalid password',
                case: "auth",
                field: "password"
            }
        } satisfies ApiResponse;
        return c.json(res, 401);
    }

    switch (user.auth_status) {
        case "pending":
            const pending_res = {
                message: "Account not verified! Please check your inbox for the verification email!",
                error: {
                    message: "Account not verified! Please check your inbox for the verification email!",
                    case: "auth",
                    field: "auth_status"
                }
            } satisfies ApiResponse;
            return c.json(pending_res, 401);
        case "blocked":
            const blocked_res = {
                message: "Your account can't be accessed at this time. Please contant an administrator.",
                error: {
                    message: "Your account can't be accessed at this time. Please contant an administrator.",
                    case: "auth",
                    field: "auth_status"
                }
            } satisfies ApiResponse;
            return c.json(blocked_res, 401);
    }

    const refreshTokenPayload = { userId: user.id, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 };
    const refreshToken = await sign(refreshTokenPayload, ENV.REFRESH_JWT_SECRET());

    const [userRefreshToken] = await db.insert(userTokensTable)
        .values({
            user_id: user.id,
            token: refreshToken,
            token_type: "refresh", expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
        })
        .returning({ id: userTokensTable.id });

    const accessTokenPayload: QuizzyJWTPAYLOAD = {
        userId: user.id,
        refreshTokenId: userRefreshToken.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 30
    }

    const accessToken = await sign(accessTokenPayload, ENV.ACCESS_JWT_SECRET())
    setCookie(c, GLOBALS.ACCESS_COOKIE_NAME, accessToken, GLOBALS.COOKIE_OPTS);

    const res = {
        message: 'login successful',
    } satisfies ApiResponse;
    return c.json(res, 200);
})

export default loginHandler;
