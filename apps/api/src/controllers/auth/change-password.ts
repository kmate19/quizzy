import GLOBALS from "@/config/globals";
import db from "@/db";
import { usersTable } from "@/db/schemas";
import checkJwt from "@/middlewares/check-jwt";
import { zv } from "@/middlewares/zv";
import { changePasswordSchema } from "@/utils/schemas/zod-schemas";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "repo";

const changePasswordHandler = GLOBALS.CONTROLLER_FACTORY(
    checkJwt(),
    zv("json", changePasswordSchema),
    async (c) => {
        const { userId } = c.get("accessTokenPayload");
        const { password, oldPassword } = c.req.valid("json");

        const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, userId));

        if (!(await Bun.password.verify(oldPassword, user.password))) {
            return c.json(
                {
                    message: "Érvénytelen régi jelszó",
                    error: {
                        message: "invalid_old_password",
                        case: "bad_request",
                    },
                } satisfies ApiResponse,
                400
            );
        }

        const newPassword = await Bun.password.hash(password);
        await db
            .update(usersTable)
            .set({ password: newPassword })
            .where(eq(usersTable.id, userId));

        const res = {
            message: "Jelszó megváltoztatva",
        } satisfies ApiResponse;
        return c.json(res, 200);
    }
);

export default changePasswordHandler;
