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
            // TEST: test this somehow (idk what could cause the fauilure here)
            const res = {
                message: "invalid",
                error: {
                    message: "invalid",
                    case: "server",
                },
            } satisfies ApiResponse;
            return c.json(res, 400);
        }

        const res = {
            message: "user verified",
        } satisfies ApiResponse;
        return c.json(res, 200);
    }
);

export default verifyHandler;
