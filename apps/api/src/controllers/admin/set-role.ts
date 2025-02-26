import GLOBALS from "@/config/globals";
import db from "@/db";
import { rolesTable, userRolesTable } from "@/db/schemas";
import check_apikey from "@/middlewares/check-apikey";
import { zv } from "@/middlewares/zv";
import { eq } from "drizzle-orm";
import { ApiResponse } from "repo";
import { z } from "zod";

const setRoleHandlers = GLOBALS.CONTROLLER_FACTORY(
    check_apikey,
    zv("json", z.object({ userId: z.string().uuid(), roleName: z.string() })),
    async (c) => {
        const { roleName, userId } = c.req.valid("json");

        try {
            await db.transaction(async (trx) => {
                const [roleid] = await trx
                    .select({ id: rolesTable.id })
                    .from(rolesTable)
                    .where(eq(rolesTable.name, roleName));
                await trx
                    .insert(userRolesTable)
                    .values({ user_id: userId, role_id: roleid.id });
            });
        } catch (e) {
            const res = {
                message: "Error setting role",
                error: {
                    message: e instanceof Error ? e.message : "Unknown error",
                    case: "conflict",
                },
            } satisfies ApiResponse;
            return c.json(res, 400);
        }

        return c.json({ message: "Role updated" });
    }
);

export default setRoleHandlers;
