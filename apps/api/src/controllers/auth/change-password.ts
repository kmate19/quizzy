import GLOBALS from "@/config/globals";
import db from "@/db";
import { LoginUserSchema, usersTable } from "@/db/schemas";
import checkJwt from "@/middlewares/check-jwt";
import { zv } from "@/middlewares/zv";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "repo";
import { z } from "zod";

const changePasswordHandler = GLOBALS.CONTROLLER_FACTORY(
    checkJwt(),
    zv(
        "json",
        LoginUserSchema.omit({ username_or_email: true }).extend({
            oldPassword: z.string(),
        })
    ),
    async (c) => {
        const { userId } = c.get("accessTokenPayload");
        const { password, oldPassword } = c.req.valid("json");

        const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, userId));

        try {
            await Bun.password.verify(oldPassword, user.password);
        } catch (e) {
            console.error("CHANGE PASSWORD ERROR", e);
            const res = {
                message: "Invalid old password",
                error: {
                    message: "invalid_old_password",
                    case: "unauthorized",
                },
            } satisfies ApiResponse;
            return c.json(res, 401);
        }

        const newPassword = await Bun.password.hash(password);
        await db
            .update(usersTable)
            .set({ password: newPassword })
            .where(eq(usersTable.id, userId));

        const res = {
            message: "password changed",
        } satisfies ApiResponse;
        return c.json(res, 200);
    }
);

export default changePasswordHandler;
