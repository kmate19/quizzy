import GLOBALS from "@/config/globals";
import db from "@/db";
import { usersTable } from "@/db/schemas";
import checkJwt from "@/middlewares/check-jwt";
import { zv } from "@/middlewares/zv";
import { eq } from "drizzle-orm";
import { ApiResponse } from "repo";
import { z } from "zod";

const getProfileByIdHandler = GLOBALS.CONTROLLER_FACTORY(checkJwt(), zv('param', z.object({ uuid: z.string().uuid() })), async (c) => {
    const { uuid } = c.req.valid("param");

    const userData = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, uuid),
        columns: {
            username: true,
            created_at: true,
            activity_status: true,
            profile_picture: true,
        },
        with: {
            roles: {
                columns: {},
                with: {
                    role: {
                        columns: {
                            name: true,
                        }
                    }
                }
            }
        }
    })

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
