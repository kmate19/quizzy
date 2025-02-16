import GLOBALS from "@/config/globals";
import db from "@/db";
import { quizzesTable } from "@/db/schemas";
import checkJwt from "@/middlewares/check-jwt";
import { eq } from "drizzle-orm";
import { ApiResponse } from "repo";

const getOwnHandlers = GLOBALS.CONTROLLER_FACTORY(checkJwt(), async (c) => {
    const { userId } = c.get("accessTokenPayload");

    // TODO: i guess we shouldnt send back any primary keys that are serial,
    // eg, for the languages and tags, do that later (other files too)
    const quizzes = await db.query.quizzesTable.findMany({
        where: eq(quizzesTable.user_id, userId),
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
});

export default getOwnHandlers;
