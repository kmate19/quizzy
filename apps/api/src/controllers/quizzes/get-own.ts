import GLOBALS from "@/config/globals";
import db from "@/db";
import { quizzesTable } from "@/db/schemas";
import checkJwt from "@/middlewares/checkJwt";
import { eq } from "drizzle-orm";
import { ApiResponse } from "repo";

const getOwn = GLOBALS.CONTROLLER_FACTORY(checkJwt(), async (c) => {
    const { userId } = c.get("accessTokenPayload");

    const quizzes = await db.select().from(quizzesTable).where(eq(quizzesTable.user_id, userId));

    const res = {
        message: "Quiz fetched",
        data: quizzes
    } satisfies ApiResponse;

    return c.json(res, 200);
});

export default getOwn;
