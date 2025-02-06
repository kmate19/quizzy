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
import { ApiResponse } from "repo";
import { z } from "zod";

const publishHandlers = GLOBALS.CONTROLLER_FACTORY(checkJwt(), zv('json', z.object({
    quiz: insertQuizSchema,
    cards: insertQuizCardsSchema.array(),
    languages: z.string().array().optional(),
    tags: z.string().array().optional(),
})), async (c) => {
    // TODO: this needs way more error handling
    const { userId } = c.get('accessTokenPayload');
    const { quiz, cards, languages, tags } = c.req.valid('json');
    const parsedQuiz = {
        ...quiz,
        banner: await makeSharpImage(Buffer.from(quiz.banner.split(';base64,')[1], 'base64'))
    }

    const parsedCards = await Promise.all(cards.map(async (card) => ({
        ...card,
        picture: await makeSharpImage(Buffer.from(card.picture.split(';base64,')[1], 'base64'))
    })));


    let quizId: { id: string };
    try {
        await db.transaction(async (tr) => {
            [quizId] = await tr.insert(quizzesTable).values({ user_id: userId, ...parsedQuiz }).returning({ id: quizzesTable.id });
            parsedCards.forEach(async (card) => {
                await tr.insert(quizCardsTable).values({ quiz_id: quizId.id, ...card });
            })

            languages ? languages.forEach(async (language) => {
                const [languageId] = await tr.select({ id: languagesTable.id }).from(languagesTable).where(eq(languagesTable.iso_code, language));
                await tr.insert(quizLanguagesTable).values({ language_id: languageId.id, quiz_id: quizId.id });
            }) : {};

            tags ? tags.forEach(async (tag) => {
                const [tagId] = await tr.select({ id: tagsTable.id }).from(tagsTable).where(eq(tagsTable.name, tag));
                await tr.insert(quizTagsTable).values({ tag_id: tagId.id, quiz_id: quizId.id });
            }) : {};
        });
    } catch (e) {
        console.error(e);
        throw new Error("Failed to publish quiz");
    }

    const res = {
        message: "Quiz published",
        data: quizId!
    } satisfies ApiResponse;

    return c.json(res, 201);
});

export default publishHandlers;
