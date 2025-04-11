import GLOBALS from "@/config/globals";
import db from "@/db";
import { quizzesTable } from "@/db/schemas";
import checkJwt from "@/middlewares/check-jwt";
import { zv } from "@/middlewares/zv";
import { and, eq } from "drizzle-orm";
import { ApiResponse } from "repo";
import { z } from "zod";

const deleteHandlers = GLOBALS.CONTROLLER_FACTORY(
    checkJwt(),
    zv("param", z.object({ quizId: z.string().uuid() })),
    async (c) => {
        const { quizId } = c.req.valid("param");
        const { userId } = c.get("accessTokenPayload");

        try {
            await db
                .delete(quizzesTable)
                .where(
                    and(
                        eq(quizzesTable.id, quizId),
                        eq(quizzesTable.user_id, userId)
                    )
                );
        } catch (e) {
            console.error(e);
            return c.json({ message: "Törlés sikertelen" }, 404);
        }

        const res = {
            message: "Kvíz sikeresen törölve",
        } satisfies ApiResponse;
        return c.json(res, 200);
    }
);

export default deleteHandlers;
