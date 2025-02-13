import GLOBALS from "@/config/globals";
import db from "@/db";
import { LoginUserSchema, usersTable } from "@/db/schemas";
import checkJwt from "@/middlewares/check-jwt";
import { zv } from "@/middlewares/zv";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "repo";

const changePasswordHandler = GLOBALS.CONTROLLER_FACTORY(checkJwt(), zv('json', LoginUserSchema.omit({ username_or_email: true })), async (c) => {
    const { userId } = c.get('accessTokenPayload');
    const { password } = c.req.valid('json');

    const newPassword = await Bun.password.hash(password);
    await db.update(usersTable).set({ password: newPassword }).where(eq(usersTable.id, userId));

    const res = {
        message: 'password changed'
    } satisfies ApiResponse;
    return c.json(res, 200)
})

export default changePasswordHandler;
