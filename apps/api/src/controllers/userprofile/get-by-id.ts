import GLOBALS from "@/config/globals";
import db from "@/db";
import { usersTable } from "@/db/schemas";
import checkJwt from "@/middlewares/checkJwt";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { ApiResponse } from "repo";
import { z } from "zod";

const getProfileByIdHandler = GLOBALS.CONTROLLER_FACTORY(checkJwt(), zValidator('param', z.object({ uuid: z.string().uuid() })), async (c) => {
    const { uuid } = c.req.valid("param");

    const [userData] = await db.select({
        email: usersTable.email,
        username: usersTable.username,
        createdAt: usersTable.created_at,
        activityStatus: usersTable.activity_status,
    }).from(usersTable).where(eq(usersTable.id, uuid))

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

export default getProfileByIdHandler;
