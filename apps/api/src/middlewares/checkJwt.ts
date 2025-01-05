import ENV from "@/config/env.ts";
import GLOBALS from "@/config/globals.ts";
import db from "@/db/index.ts";
import { usersTable } from "@/db/schemas/usersSchema.ts";
import { userTokensTable } from "@/db/schemas/userTokensSchema.ts";
import { eq } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { decode, sign, verify } from "hono/jwt";
import { JwtTokenExpired } from "hono/utils/jwt/types";

const authJwtMiddleware = (role?: string) => {
    return createMiddleware(async (c, next) => {
        let accessCookie;
        try {
            accessCookie = getCookie(c, GLOBALS.ACCESS_COOKIE_NAME)

            if (!accessCookie) {
                return c.redirect("/login");
            }

            const payload = await verify(accessCookie, ENV.ACCESS_JWT_SECRET());

            if (role) {
                const userRole = await db.query.usersTable.findFirst({
                    where: eq(usersTable.id, payload.userId as string),
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
            if (error instanceof JwtTokenExpired) {
                const { payload } = decode(accessCookie!);

                const res = await db.select().from(userTokensTable).where(eq(userTokensTable.id, payload.forId as number))
                if (!res.length) {
                    return c.redirect("/login");
                }

                const accessTokenPayload = { userId: payload.userId, forId: payload.forId, exp: Math.floor(Date.now() / 1000) + 60 * 30 };

                const accessToken = await sign(accessTokenPayload, ENV.ACCESS_JWT_SECRET())

                setCookie(c, GLOBALS.ACCESS_COOKIE_NAME, accessToken, GLOBALS.COOKIE_OPTS);
            }
        }

        console.log("authJwtMiddleware")
        await next();
    })
};

export default authJwtMiddleware;
