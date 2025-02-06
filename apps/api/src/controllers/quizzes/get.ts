import GLOBALS from "@/config/globals";
import db from "@/db";
import { quizzesTable } from "@/db/schemas";
import checkJwt from "@/middlewares/check-jwt";
import { zv } from "@/middlewares/zv";
import { numericString } from "@/utils/schemas/zod-schemas";
import { eq } from "drizzle-orm";
import { ApiResponse } from "repo";
import { z } from "zod";

const getHandlers = GLOBALS.CONTROLLER_FACTORY(checkJwt(), zv('query', z.object({ limit: numericString.refine((num) => num < 51 && num > 9).optional(), page: numericString.optional() })), async (c) => {
    const limit = c.req.valid('query').limit || 20;
    const page = c.req.valid('query').page || 1;

    const quizzes = await db.query.quizzesTable.findMany({
        where: eq(quizzesTable.status, "published"),
        columns: {
            status: false
        },
        offset: limit * (page - 1),
        limit: limit,
        with: {
            user: {
                columns: {
                    username: true,
                }
            },
            tags: {
                with: {
                    tag: true
                }
            },
            languages: {
                with: {
                    language: true
                }
            },
        }
    })

    const res = {
        message: "Quizzes fetched",
        data: quizzes
    } satisfies ApiResponse;

    return c.json(res, 200);
});

export default getHandlers;
