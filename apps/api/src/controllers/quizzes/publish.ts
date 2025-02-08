import GLOBALS from "@/config/globals";
import db from "@/db";
import {
    insertQuizCardsSchema,
    insertQuizSchema,
    languagesTable,
    quizCardsTable,
    quizLanguagesTable,
    quizTagsTable,
    quizzesTable,
    tagsTable
} from "@/db/schemas";
import checkJwt from "@/middlewares/check-jwt";
import { zv } from "@/middlewares/zv";
import { makeSharpImage } from "@/utils/helpers";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "repo";
import { z } from "zod";

const publishHandlers = GLOBALS.CONTROLLER_FACTORY(checkJwt(), zv('json', z.object({
    quiz: insertQuizSchema,
    cards: insertQuizCardsSchema.array(),
    languageISOCodes: z.string().length(2).array().optional(),
    tags: z.string().array().optional(),
})), async (c) => {
    // TODO: this needs way more error handling
    const { userId } = c.get('accessTokenPayload');
    const { quiz, cards, languageISOCodes, tags } = c.req.valid('json');

    let parsedQuiz;
    try {
        parsedQuiz = {
            ...quiz,
            banner: await makeSharpImage(Buffer.from(quiz.banner.split(';base64,')[1], 'base64'))
        }
    } catch (e) {
        console.error(e);
        const res = {
            message: "Failed to publish quiz (banner)",
            error: {
                message: "Failed to publish quiz (banner)",
                case: "bad_request"
            }
        } satisfies ApiResponse;
        return c.json(res, 400);
    }

    let parsedCards;
    try {
        parsedCards = await Promise.all(cards.map(async (card) => ({
            ...card,
            picture: await makeSharpImage(Buffer.from(card.picture.split(';base64,')[1], 'base64'))
        })));
    } catch (e) {
        const res = {
            message: "Failed to publish quiz (cards)",
            error: {
                message: "Failed to publish quiz (cards)",
                case: "bad_request"
            }
        }
        return c.json(res, 400);
    }


    let quizId: { id: string };
    try {
        await db.transaction(async (tr) => {
            [quizId] = await tr.insert(quizzesTable).values({ user_id: userId, ...parsedQuiz }).returning({ id: quizzesTable.id });

            parsedCards.forEach(async (card) => {
                await tr.insert(quizCardsTable).values({ quiz_id: quizId.id, ...card });
            })

            if (languageISOCodes) {
                for (const isoCode of languageISOCodes) {
                    const [languageId] = await tr.select({ id: languagesTable.id }).from(languagesTable).where(eq(languagesTable.iso_code, isoCode));

                    if (!languageId) {
                        const err = new Error(`Language ${isoCode} not found`)
                        err.cause = "language";
                        throw err;
                    }

                    await tr.insert(quizLanguagesTable).values({ language_id: languageId.id, quiz_id: quizId.id });
                }
            };

            if (tags) {
                for (const tag of tags) {
                    const [tagId] = await tr.select({ id: tagsTable.id }).from(tagsTable).where(eq(tagsTable.name, tag));

                    if (!tagId) {
                        const err = new Error(`Tag ${tag} not found`)
                        err.cause = "tag";
                        throw err;
                    }

                    await tr.insert(quizTagsTable).values({ tag_id: tagId.id, quiz_id: quizId.id });
                }
            }
        });
    } catch (e) {
        console.error(e);
        let errMessage = "Failed to publish quiz";
        let status: 500 | 400 = 500;

        if (e instanceof Error) {
            if (e.cause === "language" || e.cause === "tag") {
                errMessage = e.message;
                status = 400;
            }
        }

        const res = {
            message: "Failed to publish quiz",
            error: {
                message: errMessage,
                case: "server"
            }
        } satisfies ApiResponse;
        return c.json(res, status);
    }

    const res = {
        message: "Quiz published",
        data: quizId!
    } satisfies ApiResponse;

    return c.json(res, 201);
});

export default publishHandlers;
