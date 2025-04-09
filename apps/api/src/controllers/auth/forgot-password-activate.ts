import GLOBALS from "@/config/globals";
import db from "@/db/index";
import { usersTable } from "@/db/schemas/usersSchema";
import { userTokensTable } from "@/db/schemas/userTokensSchema";
import { zv } from "@/middlewares/zv";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "repo";
import { z } from "zod";

const forgotPassActivateHandler = GLOBALS.CONTROLLER_FACTORY(
    zv("param", z.object({ token: z.string() })),
    async (c) => {
        const { token } = c.req.valid("param");

        try {
            await db.transaction(async (tx) => {
                const [userAndToken] = await tx
                    .select()
                    .from(usersTable)
                    .leftJoin(
                        userTokensTable,
                        eq(userTokensTable.user_id, usersTable.id)
                    )
                    .where(eq(userTokensTable.token, token));

                if (!userAndToken.user_tokens) {
                    throw new Error("invalid");
                }
                await tx
                    .delete(userTokensTable)
                    .where(eq(userTokensTable.id, userAndToken.user_tokens.id));

                if (!userAndToken.user_tokens.data) {
                    throw new Error("invalid");
                }
                await tx
                    .update(usersTable)
                    .set({ password: userAndToken.user_tokens.data })
                    .where(eq(usersTable.id, userAndToken.users.id));
            });
        } catch (e) {
            console.error("FORGOTPW ERROR", e);
            return c.redirect("/login?error=1", 302);
        }

        return c.redirect("/login", 302);
    }
);

export default forgotPassActivateHandler;
