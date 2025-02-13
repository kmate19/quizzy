import GLOBALS from "@/config/globals";
import db from "@/db";
import { usersTable } from "@/db/schemas";
import check_apikey from "@/middlewares/check-apikey";
import { zv } from "@/middlewares/zv";
import { eq } from "drizzle-orm";
import { ApiResponse } from "repo";
import { z } from "zod";

// TODO: figure zod out
const setAuthStatusHandlers = GLOBALS.CONTROLLER_FACTORY(check_apikey, zv('json', z.object({
    userId: z.string(), status: z.union([
        z.literal("active"), z.literal("pending"), z.literal("blocked")])
})), async (c) => {
    const { userId, status } = c.req.valid('json')

    try {
        await db.update(usersTable).set({ auth_status: status }).where(eq(usersTable.id, userId))
    } catch (e) {
        const res = {
            message: "Error setting role",
            error: {
                message: e instanceof Error ? e.message : "Unknown error",
                case: "conflict"
            }
        } satisfies ApiResponse
        return c.json(res, 400)
    }

    return c.json({ message: "Role updated" })
})

export default setAuthStatusHandlers
