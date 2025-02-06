import ENV from "@/config/env";
import GLOBALS from "@/config/globals";
import db from "@/db/index";
import { usersTable } from "@/db/schemas/usersSchema";
import { userTokensTable } from "@/db/schemas/userTokensSchema";
import type { QuizzyJWTPAYLOAD } from "@/types.ts";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { decode, sign, verify } from "hono/jwt";
import type { TokenHeader } from "hono/utils/jwt/jwt";
import { JwtTokenExpired } from "hono/utils/jwt/types";
import type { ApiResponse } from "repo";

const authJwtMiddleware = (role?: string) => {
    return createMiddleware<{ Variables: { accessTokenPayload: QuizzyJWTPAYLOAD } }>(async (c, next) => {
        const accessCookie = getCookie(c, GLOBALS.ACCESS_COOKIE_NAME)

        if (!accessCookie) {
            const res = {
                message: "user not logged in",
                error: {
                    message: "user not logged in",
                    case: "unauthorized"
                }
            } as ApiResponse;
            return c.json(res, 401);
        }

        const accessTokenPayloadOrError = await verify(accessCookie, ENV.ACCESS_JWT_SECRET()).catch(e => e) as QuizzyJWTPAYLOAD;

        if (accessTokenPayloadOrError instanceof JwtTokenExpired) {
            refreshAccessToken(c, accessCookie)
        }

        if (role) {
            const [userAndRoles] = await db.query.usersTable.findMany({
                where: eq(usersTable.id, accessTokenPayloadOrError.userId),
                with: {
                    roles: {
                        with: {
                            role: true
                        }
                    }
                }
            });

            if (!userAndRoles.roles.some(r => r.role.name === role)) {
                const res = {
                    message: "user does not have the required role",
                    error: {
                        message: "user does not have the required role",
                        case: "forbidden"
                    }
                } satisfies ApiResponse;
                return c.json(res, 403);
            }
        }

        c.set("accessTokenPayload", accessTokenPayloadOrError);
        if (!next) return;
        await next();
    })
};

async function refreshAccessToken(c: Context, accessCookie: string) {
    const { payload } = decode(accessCookie) as { payload: QuizzyJWTPAYLOAD, header: TokenHeader };

    // TODO: Check if the refresh token is still valid
    const res = await db.select().from(userTokensTable).where(eq(userTokensTable.id, payload.refreshTokenId))
    if (!res.length) {
        const res = {
            message: "refresh token not found",
            error: {
                message: "refresh token not found",
                case: "unauthorized"
            }
        } satisfies ApiResponse;
        return c.json(res, 401);
    }

    const newAccessTokenPayload = { userId: payload.userId, refreshTokenId: payload.refreshTokenId, exp: Math.floor(Date.now() / 1000) + 60 * 30 };

    const accessToken = await sign(newAccessTokenPayload, ENV.ACCESS_JWT_SECRET())

    setCookie(c, GLOBALS.ACCESS_COOKIE_NAME, accessToken, GLOBALS.COOKIE_OPTS);
}

export default authJwtMiddleware;
