import GLOBALS from "@/config/globals";
import db from "@/db/index";
import { userTokensTable } from "@/db/schemas/userTokensSchema";
import checkJwt from "@/middlewares/check-jwt";
import { eq } from "drizzle-orm";
import { deleteCookie } from "hono/cookie";
import type { ApiResponse } from "repo";

const logoutHandler = GLOBALS.CONTROLLER_FACTORY(checkJwt(), async (c) => {
    await db.delete(userTokensTable).where(eq(userTokensTable.id, c.get("accessTokenPayload").refreshTokenId));

    deleteCookie(c, GLOBALS.ACCESS_COOKIE_NAME);

    const res = {
        message: 'user logged out'
    } satisfies ApiResponse;
    return c.json(res, 200)
})

export default logoutHandler;
