import GLOBALS from "@/config/globals";
import db from "@/db/index";
import { usersTable } from "@/db/schemas/usersSchema";
import { userTokensTable } from "@/db/schemas/userTokensSchema";
import { zv } from "@/middlewares/zv";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "repo";
import { z } from "zod";

const forgotPassActivateHandler = GLOBALS.CONTROLLER_FACTORY(zv("param", z.object({ token: z.string() })), async (c) => {
    const { token } = c.req.valid("param");

    try {
        await db.transaction(async (tx) => {
            const [userAndToken] = await tx.select()
                .from(usersTable)
                .leftJoin(userTokensTable, eq(userTokensTable.user_id, usersTable.id))
                .where(eq(userTokensTable.token, token));
            await tx.delete(userTokensTable).where(eq(userTokensTable.id, userAndToken.user_tokens!.id));
            await tx.update(usersTable).set({ password: userAndToken.user_tokens!.data! }).where(eq(usersTable.id, userAndToken.users.id));
        });
    } catch (e) {
        console.log(e);
        // TEST: test this somehow (idk what could cause the fauilure here)
        const res = {
            message: "invalid",
            error: {
                message: "invalid",
                case: "server"
            }
        } satisfies ApiResponse;
        return c.json(res, 400);
    }

    const res = {
        message: "temp password assigned"
    } satisfies ApiResponse;
    return c.json(res, 200);
})

export default forgotPassActivateHandler;
