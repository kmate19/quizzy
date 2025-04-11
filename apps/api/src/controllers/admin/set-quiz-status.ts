import GLOBALS from "@/config/globals";
import db from "@/db";
import { quizzesTable } from "@/db/schemas";
import check_apikey from "@/middlewares/check-apikey";
import { zv } from "@/middlewares/zv";
import { and, eq } from "drizzle-orm";
import { ApiResponse } from "repo";
import { z } from "zod";

const setQuizStatusHandlers = GLOBALS.CONTROLLER_FACTORY(
    check_apikey,
    zv(
        "json",
        z.object({
            quizId: z.string().uuid(),
            approve: z.literal("published").or(z.literal("rejected")),
        })
    ),
    async (c) => {
        const { approve, quizId } = c.req.valid("json");

        try {
            await db
                .update(quizzesTable)
                .set({ status: approve })
                .where(
                    and(
                        eq(quizzesTable.id, quizId),
                        eq(quizzesTable.status, "requires_review")
                    )
                );
        } catch (e) {
            return c.json(
                {
                    message: "Hiba történt a kvíz státuszának frissítésekor",
                    error: {
                        message: "Error updating quiz status",
                        case: "server",
                    },
                } satisfies ApiResponse,
                500
            );
        }

        return c.json({ message: "Státusz frissítve" });
    }
);

export default setQuizStatusHandlers;
