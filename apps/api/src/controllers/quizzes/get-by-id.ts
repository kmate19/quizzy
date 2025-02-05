import GLOBALS from "@/config/globals";
import db from "@/db";
import { quizzesTable } from "@/db/schemas";
import checkJwt from "@/middlewares/check-jwt";
import { zv } from "@/middlewares/zv";
import { and, eq } from "drizzle-orm";
import { ApiResponse } from "repo";
import { z } from "zod";

const getByIdHandlers = GLOBALS.CONTROLLER_FACTORY(checkJwt(), zv('param', z.object({ uuid: z.string().uuid() })), async (c) => {
    const { uuid } = c.req.valid('param')

    const [quiz] = await db.select().from(quizzesTable).where(and(eq(quizzesTable.status, "published"), eq(quizzesTable.id, uuid)));

    const res = {
        message: "Quiz fetched",
        data: quiz
    } satisfies ApiResponse;

    return c.json(res, 200);
});

export default getByIdHandlers;
