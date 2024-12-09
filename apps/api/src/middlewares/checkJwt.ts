import db from "@/db/index.ts";
import { userTokensTable } from "@/db/schemas/userTokensSchema.ts";
import { cookieName, cookieOpts } from "@/routes/auth.ts";
import { eq } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { decode, sign, verify } from "hono/jwt";
import { JwtTokenExpired } from "hono/utils/jwt/types";

const checkJwt = createMiddleware(async (c, next) => {
    let accessCookie;
    try {
        accessCookie = getCookie(c, cookieName)

        if (!accessCookie) {
            return c.redirect("/login");
        }

        await verify(accessCookie, Bun.env.ACCESS_JWT_SECRET! || "asdf");
    } catch (error) {
        if (error instanceof JwtTokenExpired) {
            const { payload } = decode(accessCookie!);

            const res = await db.select().from(userTokensTable).where(eq(userTokensTable.id, payload.forId as number))
            if (!res.length) {
                return c.redirect("/login");
            }

            const accessTokenPayload = { userId: payload.userId, forId: payload.forId, exp: Math.floor(Date.now() / 1000) + 30 };

            // TODO: fix env later
            const accessToken = await sign(accessTokenPayload, Bun.env.ACCESS_JWT_SECRET! || "asdf")

            setCookie(c, cookieName, accessToken, cookieOpts)
        }
    }

    await next();
});

export default checkJwt;
