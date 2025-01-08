import GLOBALS from "@/config/globals.ts";
import db from "@/db/index.ts";
import { userTokensTable } from "@/db/schemas/userTokensSchema.ts";
import checkJwt from "@/middlewares/checkJwt.ts";
import { eq } from "drizzle-orm";
import { deleteCookie } from "hono/cookie";

const logoutHandler = GLOBALS.CONTROLLER_FACTORY(checkJwt(), async (c) => {
    try {
        await db.delete(userTokensTable).where(eq(userTokensTable.id, c.get("accessTokenPayload").forId as number));
    } catch (error) {
        c.status(500);
        return;
    }

    deleteCookie(c, GLOBALS.ACCESS_COOKIE_NAME);

    return c.redirect("/login");
})

export default logoutHandler;
