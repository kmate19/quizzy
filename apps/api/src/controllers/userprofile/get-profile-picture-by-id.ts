import GLOBALS from "@/config/globals";
import db from "@/db";
import { usersTable } from "@/db/schemas";
import checkJwt from "@/middlewares/checkJwt";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { ApiResponse } from "repo";
import { z } from "zod";

const getProfilePictureByIdHandler = GLOBALS.CONTROLLER_FACTORY(checkJwt(), zValidator('param', z.object({ uuid: z.string().uuid() })), async (c) => {
    const { uuid } = c.req.valid("param");

    const [pfp] = await db.select({
        profilePicture: usersTable.profile_picture,
    }).from(usersTable).where(eq(usersTable.id, uuid))

    if (!pfp || !pfp.profilePicture) {
        const res = {
            message: "No profile picture",
            error: {
                message: "no_profile_picture",
                case: "not_found",
            }
        } satisfies ApiResponse;
        return c.json(res, 404);
    }

    const res = {
        message: "Success",
        data: pfp.profilePicture,
    } satisfies ApiResponse<Buffer>;

    return c.json(res, 200);
})

export default getProfilePictureByIdHandler;
