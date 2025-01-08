import ENV from "@/config/env.ts";
import GLOBALS from "@/config/globals.ts";
import db from "@/db/index.ts";
import { usersTable } from "@/db/schemas/usersSchema.ts";
import { userTokensTable } from "@/db/schemas/userTokensSchema.ts";
import type { QuizzyJWTPAYLOAD } from "@/types.ts";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { decode, sign, verify } from "hono/jwt";
import type { TokenHeader } from "hono/utils/jwt/jwt";
import { JwtTokenExpired } from "hono/utils/jwt/types";

const authJwtMiddleware = (role?: string) => {
    return createMiddleware<{ Variables: { accessTokenPayload: QuizzyJWTPAYLOAD } }>(async (c, next) => {
        const accessCookie = getCookie(c, GLOBALS.ACCESS_COOKIE_NAME)

        if (!accessCookie) {
            return c.redirect("/login");
        }

        const accessTokenPayloadOrError = await verify(accessCookie, ENV.ACCESS_JWT_SECRET()).catch(e => e) as QuizzyJWTPAYLOAD;

        if (accessTokenPayloadOrError instanceof JwtTokenExpired) {
            refreshAccessToken(c, accessCookie)
        } else if (accessTokenPayloadOrError instanceof Error) {
            console.log(accessTokenPayloadOrError);
            c.status(500);
            return c.redirect("/login");
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
                c.status(404);
                return c.redirect("/404");
            }
        }

        c.set("accessTokenPayload", accessTokenPayloadOrError);
        await next();
    })
};

async function refreshAccessToken(c: Context, accessCookie: string) {
    const { payload } = decode(accessCookie) as { payload: QuizzyJWTPAYLOAD, header: TokenHeader };

    // TODO: Check if the refresh token is still valid
    const res = await db.select().from(userTokensTable).where(eq(userTokensTable.id, payload.refreshTokenId))
    if (!res.length) {
        return c.redirect("/login");
    }

    const newAccessTokenPayload = { userId: payload.userId, refreshTokenId: payload.refreshTokenId, exp: Math.floor(Date.now() / 1000) + 60 * 30 };

    const accessToken = await sign(newAccessTokenPayload, ENV.ACCESS_JWT_SECRET())

    setCookie(c, GLOBALS.ACCESS_COOKIE_NAME, accessToken, GLOBALS.COOKIE_OPTS);
}

export default authJwtMiddleware;
