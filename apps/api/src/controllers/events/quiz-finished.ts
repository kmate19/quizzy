import GLOBALS from "@/config/globals";
import db from "@/db";
import { quizzesTable, userStatsTable } from "@/db/schemas";
import { zv } from "@/middlewares/zv";
import { tryCatchAsyncClosure } from "@/utils/helpers";
import { quizFinishedSchema } from "@/utils/schemas/zod-schemas";
import { eq, sql } from "drizzle-orm";
import { PgUpdateSetSource } from "drizzle-orm/pg-core";
import { ApiResponse } from "repo";

const quizFinishedHandlers = GLOBALS.CONTROLLER_FACTORY(
    zv("json", quizFinishedSchema),
    async (c) => {
        const { userId, quizId, type, meta } = c.req.valid("json");

        const quizUpdateResult = await tryCatchAsyncClosure(async () => {
            await db
                .update(quizzesTable)
                .set({ plays: sql`${quizzesTable.plays} + 1` })
                .where(eq(quizzesTable.id, quizId));
        });

        if (quizUpdateResult) {
            const res = {
                message: "Error updating quiz play count",
                error: {
                    message: "play count update failed",
                    case: "server",
                },
            } satisfies ApiResponse;

            return c.json(res, 400);
        }

        let updatedValues: PgUpdateSetSource<typeof userStatsTable>;
        if (type === "multi") {
            updatedValues = {
                plays: sql`${userStatsTable.plays} + 1`,
            };

            if (meta.placement === 1) {
                updatedValues.first_places = sql`${userStatsTable.first_places} + 1`;
            } else if (meta.placement === 2) {
                updatedValues.second_places = sql`${userStatsTable.second_places} + 1`;
            } else if (meta.placement === 3) {
                updatedValues.third_places = sql`${userStatsTable.third_places} + 1`;
            }

            updatedValues.wrong_answers = sql`${userStatsTable.wrong_answers} + ${meta.wrongAnswerCount}`;
            updatedValues.correct_answers = sql`${userStatsTable.correct_answers} + ${meta.correctAnswerCount}`;
        } else {
            updatedValues = {
                plays: sql`${userStatsTable.plays} + 1`,
            };
        }

        const userStatUpdateResult = await tryCatchAsyncClosure(async () => {
            await db
                .update(userStatsTable)
                .set(updatedValues)
                .where(eq(userStatsTable.user_id, userId));
        });

        if (userStatUpdateResult) {
            const res = {
                message: "Error updating user stats",
                error: {
                    message: "user stat update failed",
                    case: "server",
                },
            } satisfies ApiResponse;

            return c.json(res, 400);
        }

        const res = {
            message: "event successful",
        } satisfies ApiResponse;
        return c.json(res, 200);
    }
);

export default quizFinishedHandlers;
