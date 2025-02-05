import GLOBALS from "@/config/globals";
import db from "@/db/index";
import { usersTable } from "@/db/schemas/usersSchema";
import { userTokensTable } from "@/db/schemas/userTokensSchema";
import { zv } from "@/middlewares/zv";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "repo";
import { z } from "zod";

const verifyHandler = GLOBALS.CONTROLLER_FACTORY(zv("param", z.object({ emailHash: z.string() })), async (c) => {
    const emailHash = c.req.valid("param").emailHash;

    const [userAndToken] = await db.select()
        .from(usersTable)
        .leftJoin(userTokensTable, eq(userTokensTable.user_id, usersTable.id))
        .where(eq(userTokensTable.token, emailHash));

    await db.update(usersTable).set({ auth_status: "active" }).where(eq(usersTable.id, userAndToken.users.id));
    await db.delete(userTokensTable).where(eq(userTokensTable.id, userAndToken.user_tokens!.id));

    const res = {
        message: "user verified"
    } satisfies ApiResponse;
    return c.json(res, 200);
})

export default verifyHandler;
