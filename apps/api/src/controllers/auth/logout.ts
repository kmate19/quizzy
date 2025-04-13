import GLOBALS from "@/config/globals";
import db from "@/db/index";
import { userTokensTable } from "@/db/schemas/userTokensSchema";
import checkJwt from "@/middlewares/check-jwt";
import { eq } from "drizzle-orm";
import { deleteCookie } from "hono/cookie";
import type { ApiResponse } from "repo";

const logoutHandler = GLOBALS.CONTROLLER_FACTORY(checkJwt(), async (c) => {
    await db
        .delete(userTokensTable)
        .where(
            eq(userTokensTable.id, c.get("accessTokenPayload").refreshTokenId)
        );

    deleteCookie(c, GLOBALS.ACCESS_COOKIE_NAME, GLOBALS.COOKIE_OPTS);

    const res = {
        message: "Felhasználó kijelentkezve",
    } satisfies ApiResponse;
    return c.json(res, 200);
});

export default logoutHandler;
