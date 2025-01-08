import ENV from "@/config/env.ts";
import GLOBALS from "@/config/globals.ts";
import db from "@/db/index.ts";
import { usersTable } from "@/db/schemas/usersSchema.ts";
import { userTokensTable } from "@/db/schemas/userTokensSchema.ts";
import type { QuizzyJWTPAYLOAD } from "@/types.ts";
import { eq } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { decode, sign, verify } from "hono/jwt";
import type { TokenHeader } from "hono/utils/jwt/jwt";
import { JwtTokenExpired } from "hono/utils/jwt/types";

const authJwtMiddleware = (role?: string) => {
    return createMiddleware<{ Variables: { accessTokenPayload: QuizzyJWTPAYLOAD } }>(async (c, next) => {
        let accessCookie: string | undefined;
        let accessTokenPayload: QuizzyJWTPAYLOAD | null = null;
        try {
            accessCookie = getCookie(c, GLOBALS.ACCESS_COOKIE_NAME)

            if (!accessCookie) {
                return c.redirect("/login");
            }

            accessTokenPayload = await verify(accessCookie, ENV.ACCESS_JWT_SECRET()) as QuizzyJWTPAYLOAD;

            if (role) {
                const userRole = await db.query.usersTable.findFirst({
                    where: eq(usersTable.id, accessTokenPayload.userId),
                    with: {
                        roles: {
                            with: {
                                role: true
                            }
                        }
                    }
                });
                if (!userRole?.roles.some(r => r.role.name === role)) {
                    c.status(404);
                    return c.redirect("/404");
                }
            }
        } catch (error) {
            console.log(error)
            if (error instanceof JwtTokenExpired && accessCookie) {
                const { payload } = decode(accessCookie) as { payload: QuizzyJWTPAYLOAD, header: TokenHeader };

                const res = await db.select().from(userTokensTable).where(eq(userTokensTable.id, payload.refreshTokenId))
                if (!res.length) {
                    return c.redirect("/login");
                }

                accessTokenPayload = { userId: payload.userId, refreshTokenId: payload.refreshTokenId, exp: Math.floor(Date.now() / 1000) + 60 * 30 };

                const accessToken = await sign(accessTokenPayload, ENV.ACCESS_JWT_SECRET())

                setCookie(c, GLOBALS.ACCESS_COOKIE_NAME, accessToken, GLOBALS.COOKIE_OPTS);
            }
        }

        if (!accessTokenPayload) {
            c.status(500)
            return c.redirect("/login");
        }
        c.set("accessTokenPayload", accessTokenPayload);
        await next();
    })
};

export default authJwtMiddleware;
