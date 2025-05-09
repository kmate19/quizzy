import ENV from "@/config/env";
import GLOBALS from "@/config/globals";
import db from "@/db/index";
import { LoginUserSchema, usersTable } from "@/db/schemas/usersSchema";
import { userTokensTable } from "@/db/schemas/userTokensSchema";
import { makeRateLimiter } from "@/middlewares/ratelimiters";
import { zv } from "@/middlewares/zv";
import type { QuizzyJWTPAYLOAD } from "@/types.ts";
import { makeDefaultPfp } from "@/utils/helpers";
import { eq, or } from "drizzle-orm";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import type { ApiResponse } from "repo";

const loginHandler = GLOBALS.CONTROLLER_FACTORY(
    zv("json", LoginUserSchema),
    makeRateLimiter(1, 15, false, undefined, false, true),
    async (c) => {
        const loginUserData = c.req.valid("json");

        const [user] = await db
            .select()
            .from(usersTable)
            .where(
                or(
                    eq(usersTable.username, loginUserData.username_or_email),
                    eq(usersTable.email, loginUserData.username_or_email)
                )
            );

        if (!user) {
            const res = {
                message: "Érvénytelen bejelentkezési adatok, próbálja újra!",
                error: {
                    message: "invalid_creds",
                    case: "bad_request",
                },
            } satisfies ApiResponse;
            return c.json(res, 400);
        }

        if (
            !(await Bun.password.verify(loginUserData.password, user.password))
        ) {
            const res = {
                message: "Érvénytelen bejelentkezési adatok, próbálja újra!",
                error: {
                    message: "invalid_creds",
                    case: "bad_request",
                },
            } satisfies ApiResponse;
            return c.json(res, 400);
        }

        switch (user.auth_status) {
            case "pending": {
                const pending_res = {
                    // message:
                    //     "Account not verified! Please check your inbox for the verification email!",
                    message:
                        "Fiók nem ellenőrzött! Kérjük, ellenőrizze beérkező leveleit a megerősítő e-mailhez!",
                    error: {
                        message:
                            "Account not verified! Please check your inbox for the verification email!",
                        case: "auth",
                        field: "auth_status",
                    },
                } satisfies ApiResponse;
                return c.json(pending_res, 401);
            }
            case "blocked": {
                const blocked_res = {
                    // message:
                    //     "Your account can't be accessed at this time. Please contant an administrator.",
                    message:
                        "A fiókjához jelenleg nem lehet hozzáférni. Kérjük, lépjen kapcsolatba egy rendszergazdával.",
                    error: {
                        message:
                            "Your account can't be accessed at this time. Please contant an administrator.",
                        case: "auth",
                        field: "auth_status",
                    },
                } satisfies ApiResponse;
                return c.json(blocked_res, 401);
            }
        }

        if (user.firstTimeLogin) {
            await db
                .update(usersTable)
                .set({
                    profile_picture: await makeDefaultPfp(user.username),
                    firstTimeLogin: false,
                })
                .where(eq(usersTable.id, user.id));
        }

        const refreshTokenPayload = {
            userId: user.id,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
        };
        const refreshToken = await sign(
            refreshTokenPayload,
            ENV.REFRESH_JWT_SECRET()
        );

        const [userRefreshToken] = await db
            .insert(userTokensTable)
            .values({
                user_id: user.id,
                token: refreshToken,
                token_type: "refresh",
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            })
            .returning({ id: userTokensTable.id })
            .onConflictDoUpdate({
                target: userTokensTable.token,
                set: { token: refreshToken },
            });

        const accessTokenPayload: QuizzyJWTPAYLOAD = {
            userId: user.id,
            refreshTokenId: userRefreshToken.id,
            exp: Math.floor(Date.now() / 1000) + 60 * 15,
        };

        const accessToken = await sign(
            accessTokenPayload,
            ENV.ACCESS_JWT_SECRET()
        );
        setCookie(
            c,
            GLOBALS.ACCESS_COOKIE_NAME,
            accessToken,
            GLOBALS.COOKIE_OPTS
        );

        const res = {
            message: "Sikeres bejelentkezés",
        } satisfies ApiResponse;
        return c.json(res, 200);
    }
);

export default loginHandler;
