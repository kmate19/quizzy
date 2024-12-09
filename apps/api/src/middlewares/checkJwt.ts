import ENV from "@/config/env.ts";
import GLOBALS from "@/config/globals.ts";
import db from "@/db/index.ts";
import { userTokensTable } from "@/db/schemas/userTokensSchema.ts";
import { eq } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { decode, sign, verify } from "hono/jwt";
import { JwtTokenExpired } from "hono/utils/jwt/types";

const checkJwt = createMiddleware(async (c, next) => {
    let accessCookie;
    try {
        accessCookie = getCookie(c, GLOBALS.ACCESS_COOKIE_NAME)

        if (!accessCookie) {
            return c.redirect("/login");
        }

        await verify(accessCookie, ENV.ACCESS_JWT_SECRET());
    } catch (error) {
        if (error instanceof JwtTokenExpired) {
            const { payload } = decode(accessCookie!);

            const res = await db.select().from(userTokensTable).where(eq(userTokensTable.id, payload.forId as number))
            if (!res.length) {
                return c.redirect("/login");
            }

            const accessTokenPayload = { userId: payload.userId, forId: payload.forId, exp: Math.floor(Date.now() / 1000) + 30 };

            const accessToken = await sign(accessTokenPayload, ENV.ACCESS_JWT_SECRET())

            setCookie(c, GLOBALS.ACCESS_COOKIE_NAME, accessToken, GLOBALS.COOKIE_OPTS);
        }
    }

    await next();
});

export default checkJwt;
