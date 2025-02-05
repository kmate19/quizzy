import GLOBALS from "@/config/globals";
import db from "@/db";
import { quizzesTable } from "@/db/schemas";
import checkJwt from "@/middlewares/checkJwt";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { ApiResponse } from "repo";
import { z } from "zod";

const getHandlers = GLOBALS.CONTROLLER_FACTORY(checkJwt(), zValidator('query', z.object({ limit: z.string().regex(/^\d+$/).transform(Number).optional() })), async (c) => {
    const limit = c.req.valid('query').limit || 20;

    if (limit > 50) {
        const res = {
            message: "Limit cannot exceed 50",
            error: {
                message: "Limit cannot exceed 50",
                case: "bad_request"
            }
        } satisfies ApiResponse;

        return c.json(res, 400);
    }

    const quizzes = await db.select().from(quizzesTable).where(eq(quizzesTable.status, "published")).limit(limit);

    const res = {
        message: "Quizzes fetched",
        data: quizzes
    } satisfies ApiResponse;

    return c.json(res, 200);
});

export default getHandlers;
