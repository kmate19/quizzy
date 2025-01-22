import GLOBALS from "@/config/globals.ts";
import db from "@/db/index.ts";
import { usersTable } from "@/db/schemas/usersSchema.ts";
import { userTokensTable } from "@/db/schemas/userTokensSchema.ts";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "repo";
import { z } from "zod";

const verifyHandler = GLOBALS.CONTROLLER_FACTORY(zValidator("param", z.object({ emailHash: z.string() })), async (c) => {
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
