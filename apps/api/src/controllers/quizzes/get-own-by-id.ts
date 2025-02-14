import GLOBALS from "@/config/globals";
import db from "@/db";
import { quizzesTable } from "@/db/schemas";
import checkJwt from "@/middlewares/check-jwt";
import { zv } from "@/middlewares/zv";
import { and, eq } from "drizzle-orm";
import { ApiResponse } from "repo";
import { z } from "zod";

const getOwnByIdHandlers = GLOBALS.CONTROLLER_FACTORY(checkJwt(), zv('param', z.object({ quizId: z.string().uuid() })), async (c) => {
    const { quizId } = c.req.valid('param')
    const { userId } = c.get("accessTokenPayload");

    const quiz = await db.query.quizzesTable.findFirst({
        where: and(eq(quizzesTable.user_id, userId), eq(quizzesTable.id, quizId)),
        with: {
            cards: true,
            tags: {
                columns: {},
                with: {
                    tag: {
                        columns: {
                            name: true
                        }
                    }
                }
            },
            languages: {
                columns: {},
                with: {
                    language: {
                        columns: {
                            name: true,
                            iso_code: true,
                            support: true,
                            icon: true
                        }
                    }
                }
            },
        }
    });

    if (!quiz) {
        const res = {
            message: "Quiz not found",
            error: {
                message: "Quiz not found",
                case: "not_found"
            }
        } satisfies ApiResponse;

        return c.json(res, 404);
    }

    const res = {
        message: "Quiz fetched",
        data: quiz
    } satisfies ApiResponse;

    return c.json(res, 200);
});

export default getOwnByIdHandlers;
