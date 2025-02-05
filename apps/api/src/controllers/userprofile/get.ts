import GLOBALS from "@/config/globals";
import db from "@/db";
import { usersTable } from "@/db/schemas";
import checkJwt from "@/middlewares/check-jwt";
import { eq } from "drizzle-orm";
import { ApiResponse } from "repo";

const getBaseDataHandler = GLOBALS.CONTROLLER_FACTORY(checkJwt(), async (c) => {
    const { userId } = c.get("accessTokenPayload");

    const [userData] = await db.select({
        email: usersTable.email,
        username: usersTable.username,
        createdAt: usersTable.created_at,
        activityStatus: usersTable.activity_status,
    }).from(usersTable).where(eq(usersTable.id, userId))

    if (!userData) {
        const res = {
            message: "User not found",
            error: {
                message: "User not found",
                case: "not_found",
            }
        } satisfies ApiResponse;
        return c.json(res, 404);
    }

    const res = {
        message: "Success",
        data: userData,
    } satisfies ApiResponse;

    return c.json(res, 200);
})

export default getBaseDataHandler;
