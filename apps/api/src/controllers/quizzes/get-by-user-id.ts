import GLOBALS from "@/config/globals";
import db from "@/db";
import { quizzesTable } from "@/db/schemas";
import checkJwt from "@/middlewares/check-jwt";
import { zv } from "@/middlewares/zv";
import { and, eq } from "drizzle-orm";
import { ApiResponse } from "repo";
import { z } from "zod";

const getByUserIdHandlers = GLOBALS.CONTROLLER_FACTORY(
    checkJwt(),
    zv("param", z.object({ userId: z.string().uuid() })),
    async (c) => {
        const { userId } = c.req.valid("param");

        const quizzes = await db.query.quizzesTable.findMany({
            where: and(
                eq(quizzesTable.status, "published"),
                eq(quizzesTable.user_id, userId)
            ),
            with: {
                tags: {
                    columns: {},
                    with: {
                        tag: {
                            columns: {
                                name: true,
                            },
                        },
                    },
                },
                languages: {
                    columns: {},
                    with: {
                        language: {
                            columns: {
                                name: true,
                                iso_code: true,
                                support: true,
                                icon: true,
                            },
                        },
                    },
                },
            },
        });

        const res = {
            message: "Quiz fetched",
            data: quizzes,
        } satisfies ApiResponse;

        return c.json(res, 200);
    }
);

export default getByUserIdHandlers;
