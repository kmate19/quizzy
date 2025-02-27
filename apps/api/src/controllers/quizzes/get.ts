import GLOBALS from "@/config/globals";
import db from "@/db";
import { quizzesTable } from "@/db/schemas";
import checkJwt from "@/middlewares/check-jwt";
import { zv } from "@/middlewares/zv";
import { paginationSchema } from "@/utils/schemas/zod-schemas";
import { eq, sql } from "drizzle-orm";
import { ApiResponse } from "repo";

const getHandlers = GLOBALS.CONTROLLER_FACTORY(
    checkJwt(),
    zv("query", paginationSchema),
    async (c) => {
        const limit = c.req.valid("query").limit || 20;
        const page = c.req.valid("query").page || 1;

        const offset = limit * (page - 1);

        const quizzesWCount = await db.query.quizzesTable.findMany({
            extras: {
                totalCount: sql<number>`COUNT(*) OVER()`.as("total_count"),
            },
            where: eq(quizzesTable.status, "published"),
            columns: {
                status: false,
            },
            offset,
            limit,
            with: {
                user: {
                    columns: {
                        username: true,
                    },
                },
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

        const totalCount = quizzesWCount[0]?.totalCount || 0;

        // eslint-disable-next-line
        const quizzes = quizzesWCount.map(({ totalCount, ...rest }) => rest);

        const res = {
            message: "Quizzes fetched",
            data: { quizzes, totalCount },
        } satisfies ApiResponse;

        return c.json(res, 200);
    }
);

export default getHandlers;
