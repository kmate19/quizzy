import GLOBALS from "@/config/globals";
import db from "@/db";
import { quizzesTable } from "@/db/schemas";
import check_apikey from "@/middlewares/check-apikey";
import { zv } from "@/middlewares/zv";
import { and, eq } from "drizzle-orm";
import { ApiResponse } from "repo";
import { z } from "zod";

const getAllQuizHandlers = GLOBALS.CONTROLLER_FACTORY(
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
            const res = {
                message: "Error updating quiz status",
                error: {
                    message: e instanceof Error ? e.message : "Unknown error",
                    case: "conflict",
                },
            } satisfies ApiResponse;
            return c.json(res, 400);
        }

        return c.json({ message: "Status updated" });
    }
);

export default getAllQuizHandlers;
