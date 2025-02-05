import GLOBALS from "@/config/globals";
import db from "@/db";
import {
    insertLanguageSchema,
    insertQuizCardsSchema,
    insertQuizSchema,
    insertTagSchema,
    languagesTable,
    quizCardsTable,
    quizLanguagesTable,
    quizTagsTable,
    quizzesTable,
    tagsTable
} from "@/db/schemas";
import checkJwt from "@/middlewares/checkJwt";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { ApiResponse } from "repo";
import { z } from "zod";

const publishHandlers = GLOBALS.CONTROLLER_FACTORY(checkJwt(), zValidator('json', z.object({
    quiz: insertQuizSchema,
    cards: insertQuizCardsSchema.array(),
    languages: insertLanguageSchema.array().optional(),
    tags: insertTagSchema.array().optional(),
})), async (c) => {
    // TODO: this needs way more error handling
    const { userId } = c.get('accessTokenPayload');
    const { quiz, cards, languages, tags } = c.req.valid('json');
    const parsedQuiz = {
        ...quiz,
        banner: Buffer.from(quiz.banner, 'base64'),
    }

    const parsedCards = cards.map((card) => ({
        ...card,
        picture: Buffer.from(card.picture, 'base64'),
    }));

    try {
        await db.transaction(async (tr) => {
            const [quizId] = await tr.insert(quizzesTable).values({ user_id: userId, ...parsedQuiz }).returning({ id: quizzesTable.id });
            parsedCards.forEach(async (card) => {
                await tr.insert(quizCardsTable).values({ quiz_id: quizId.id, ...card });
            })

            languages ? languages.forEach(async (language) => {
                const [languageId] = await tr.select({ id: languagesTable.id }).from(languagesTable).where(eq(languagesTable.iso_code, language.iso_code));
                await tr.insert(quizLanguagesTable).values({ language_id: languageId.id, quiz_id: quizId.id });
            }) : {};

            tags ? tags.forEach(async (tag) => {
                const [tagId] = await tr.select({ id: tagsTable.id }).from(tagsTable).where(eq(tagsTable.name, tag.name));
                await tr.insert(quizTagsTable).values({ tag_id: tagId.id, quiz_id: quizId.id });
            }) : {};
        });
    } catch (e) {
        console.error(e);
        throw new Error("Failed to publish quiz");
    }

    const res = {
        message: "Quiz published",
    } satisfies ApiResponse;

    return c.json(res, 201);
});

export default publishHandlers;
