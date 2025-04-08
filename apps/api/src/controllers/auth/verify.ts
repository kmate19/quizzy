import GLOBALS from "@/config/globals";
import db from "@/db/index";
import { usersTable } from "@/db/schemas/usersSchema";
import { userTokensTable } from "@/db/schemas/userTokensSchema";
import { zv } from "@/middlewares/zv";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "repo";
import { z } from "zod";

const verifyHandler = GLOBALS.CONTROLLER_FACTORY(
    zv("param", z.object({ emailHash: z.string() })),
    async (c) => {
        const emailHash = c.req.valid("param").emailHash;

        try {
            await db.transaction(async (tx) => {
                const [userAndToken] = await tx
                    .select()
                    .from(usersTable)
                    .leftJoin(
                        userTokensTable,
                        eq(userTokensTable.user_id, usersTable.id)
                    )
                    .where(eq(userTokensTable.token, emailHash));
                await tx
                    .update(usersTable)
                    .set({ auth_status: "active" })
                    .where(eq(usersTable.id, userAndToken.users.id));
                if (!userAndToken.user_tokens) {
                    throw new Error("invalid");
                }
                await tx
                    .delete(userTokensTable)
                    .where(eq(userTokensTable.id, userAndToken.user_tokens.id));
            });
        } catch (e) {
            console.error("VERIFY ERROR", e);
            return c.redirect("/login?error=1", 302);
        }

        return c.redirect("/login", 302);
    }
);

export default verifyHandler;
