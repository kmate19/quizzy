import ENV from "@/config/env.ts";
import GLOBALS from "@/config/globals.ts";
import db from "@/db/index.ts";
import { userTokensTable } from "@/db/schemas/userTokensSchema.ts";
import { eq } from "drizzle-orm";
import { deleteCookie, getCookie } from "hono/cookie";
import { verify } from "hono/jwt";

const logoutHandler = GLOBALS.CONTROLLER_FACTORY(async (c) => {
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

export default logoutHandler;
