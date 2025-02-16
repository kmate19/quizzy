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
import { fileTypeFromBuffer } from "file-type";
import type { ApiResponse } from "repo";
import { z } from "zod";

const publishHandlers = GLOBALS.CONTROLLER_FACTORY(checkJwt(), zv('json', z.object({
    quiz: insertQuizSchema,
    cards: insertQuizCardsSchema.array().min(1).max(10),
    languageISOCodes: z.string().length(2).array().optional(),
    tags: z.string().array().optional(),
})), async (c) => {
    const { userId } = c.get('accessTokenPayload');
    const { quiz, cards, languageISOCodes, tags } = c.req.valid('json');

    const existingQuizzes = await db.select({ id: quizzesTable.id }).from(quizzesTable).where(eq(quizzesTable.user_id, userId));
    if (existingQuizzes.length >= 10) {
        const res = {
            message: "User has too many quizzes Max 10",
            error: {
                message: "user_has_too_many_quizzes",
                case: "bad_request",
            }
        } satisfies ApiResponse;

        return c.json(res, 400);
    }

    if (cards.length >= 10) {
        const res = {
            message: "Quiz has too many cards Max 10",
            error: {
                message: "quiz_has_too_many_cards",
                case: "bad_request",
            }
        } satisfies ApiResponse;

        return c.json(res, 400);
    }

    let parsedQuiz;
    try {
        const rawFileBuf = Buffer.from(quiz.banner.split(';base64,')[1], 'base64');
        const fileInfoRaw = await fileTypeFromBuffer(rawFileBuf);

        if (!fileInfoRaw || !fileInfoRaw.mime.startsWith('image/')) {
            const res = {
                message: "Invalid file type",
                error: {
                    message: "invalid_file_type",
                    case: "bad_request",
                }
            } satisfies ApiResponse;

            return c.json(res, 400);
        };

        if (rawFileBuf.length > 1024 * 1024) {
            const res = {
                message: "File too large maximum 1MB",
                error: {
                    message: "file_too_large",
                    case: "bad_request",
                }
            }

            return c.json(res, 400);
        }

        const parsedBanner = await makeSharpImage(rawFileBuf);

        parsedQuiz = {
            ...quiz,
            banner: parsedBanner
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

    let parsedCards = [];
    try {
        for (const card of cards) {
            const rawFileBuf = Buffer.from(card.picture.split(';base64,')[1], 'base64');
            const fileInfoRaw = await fileTypeFromBuffer(rawFileBuf);

            if (!fileInfoRaw || !fileInfoRaw.mime.startsWith('image/')) {
                const res = {
                    message: "Invalid file type",
                    error: {
                        message: "invalid_file_type",
                        case: "bad_request",
                    }
                } satisfies ApiResponse;

                return c.json(res, 400);
            };

            if (rawFileBuf.length > 1024 * 1024) {
                const res = {
                    message: "File too large maximum 1MB",
                    error: {
                        message: "file_too_large",
                        case: "bad_request",
                    }
                }

                return c.json(res, 400);
            }
            parsedCards.push({
                ...card,
                picture: await makeSharpImage(Buffer.from(card.picture.split(';base64,')[1], 'base64'))
            });
        };
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

        if (status === 500) throw e;

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
