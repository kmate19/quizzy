import GLOBALS from "@/config/globals";
import db from "@/db/index";
import { userApiKeys } from "@/db/schemas/userApiKeysSchema";
import checkJwt from "@/middlewares/check-jwt";
import { zv } from "@/middlewares/zv";
import { numericStringSchema } from "@/utils/schemas/zod-schemas";
import { and, eq } from "drizzle-orm";
import type { ApiResponse } from "repo";
import { z } from "zod";

const deleteHandler = GLOBALS.CONTROLLER_FACTORY(
    checkJwt("admin"),
    zv("param", z.object({ id: numericStringSchema })),
    async (c) => {
        const [deleted] = await db
            .delete(userApiKeys)
            .where(
                and(
                    eq(userApiKeys.user_id, c.get("accessTokenPayload").userId),
                    eq(userApiKeys.id_by_user, c.req.valid("param").id)
                )
            )
            .returning();

        if (!deleted) {
            const res = {
                message: "API kulcs nem található",
                error: {
                    message: "API key not found",
                    case: "not_found",
                },
            } satisfies ApiResponse;
            return c.json(res, 404);
        }

        const res = {
            message: "API kulcs törölve",
        } satisfies ApiResponse;
        return c.json(res, 200);
    }
);

export default deleteHandler;
