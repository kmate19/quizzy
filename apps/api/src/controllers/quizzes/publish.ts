import GLOBALS from "@/config/globals";
import db from "@/db";
import {
    languagesTable,
    QuizCardInsert,
    quizCardsTable,
    quizLanguagesTable,
    quizTagsTable,
    quizzesTable,
    tagsTable,
} from "@/db/schemas";
import checkJwt from "@/middlewares/check-jwt";
import { makeRateLimiter } from "@/middlewares/ratelimiters";
import { zv } from "@/middlewares/zv";
import { processImage } from "@/utils/helpers";
import { publishQuizSchema } from "@/utils/schemas/zod-schemas";
import { eq } from "drizzle-orm";
import { fileTypeFromBuffer } from "file-type";
import type { ApiResponse } from "repo";

const publishHandlers = GLOBALS.CONTROLLER_FACTORY(
    checkJwt(),
    makeRateLimiter(1, 1, true, undefined, true),
    zv("json", publishQuizSchema),
    async (c) => {
        const { userId } = c.get("accessTokenPayload");
        const {
            quiz,
            cards,
            languageISOCodes,
            tagNames: tags,
        } = c.req.valid("json");

        const existingQuizzes = await db
            .select({ id: quizzesTable.id })
            .from(quizzesTable)
            .where(eq(quizzesTable.user_id, userId));
        if (existingQuizzes.length >= 10) {
            const res = {
                message: "A felhasználónak túl sok kvíze van, maximum 10",
                error: {
                    message: "user_has_too_many_quizzes",
                    case: "bad_request",
                },
            } satisfies ApiResponse;

            return c.json(res, 400);
        }

        if (cards.length > 10) {
            const res = {
                message: "A kvíznek túl sok kártyája van, maximum 10",
                error: {
                    message: "quiz_has_too_many_cards",
                    case: "bad_request",
                },
            } satisfies ApiResponse;

            return c.json(res, 400);
        }

        let parsedQuiz;
        try {
            const rawFileBuf = Buffer.from(
                quiz.banner.split(";base64,")[1],
                "base64"
            );
            const fileInfoRaw = await fileTypeFromBuffer(rawFileBuf);

            if (!fileInfoRaw || !fileInfoRaw.mime.startsWith("image/")) {
                const res = {
                    message: "Érvénytelen fájltípus",
                    error: {
                        message: "invalid_file_type",
                        case: "bad_request",
                    },
                } satisfies ApiResponse;

                return c.json(res, 400);
            }

            if (rawFileBuf.length > 1024 * 1024) {
                const res = {
                    message: "A fájl túl nagy, maximum 1MB",
                    error: {
                        message: "file_too_large",
                        case: "bad_request",
                    },
                } satisfies ApiResponse;

                return c.json(res, 400);
            }

            const parsedBanner = await processImage(rawFileBuf);

            parsedQuiz = {
                ...quiz,
                banner: parsedBanner,
            };
        } catch (e) {
            console.error(e);
            const res = {
                message: "A fejléc hibás formátumú",
                error: {
                    message: "Failed to publish quiz (banner)",
                    case: "bad_request",
                },
            } satisfies ApiResponse;
            return c.json(res, 400);
        }

        const parsedCards: Omit<QuizCardInsert, "quiz_id">[] = [];
        try {
            for (const card of cards) {
                const rawFileBuf = Buffer.from(
                    card.picture.split(";base64,")[1],
                    "base64"
                );
                const fileInfoRaw = await fileTypeFromBuffer(rawFileBuf);

                if (!fileInfoRaw || !fileInfoRaw.mime.startsWith("image/")) {
                    const res = {
                        message: "Érvénytelen fájltípus",
                        error: {
                            message: "invalid_file_type",
                            case: "bad_request",
                        },
                    } satisfies ApiResponse;

                    return c.json(res, 400);
                }

                if (rawFileBuf.length > 1024 * 1024) {
                    const res = {
                        message: "A fájl túl nagy, maximum 1MB",
                        error: {
                            message: "file_too_large",
                            case: "bad_request",
                        },
                    } satisfies ApiResponse;

                    return c.json(res, 400);
                }
                parsedCards.push({
                    ...card,
                    picture: await processImage(
                        Buffer.from(card.picture.split(";base64,")[1], "base64")
                    ),
                });
            }
        } catch (e) {
            console.error("QUIZ PUBLISH ERROR (CARDS)", e);
            const res = {
                message: "A kártyák hibás formátumúak",
                error: {
                    message: "Failed to publish quiz (cards)",
                    case: "bad_request",
                },
            };
            return c.json(res, 400);
        }

        let quizId: { id: string } | undefined;
        try {
            await db.transaction(async (tr) => {
                [quizId] = await tr
                    .insert(quizzesTable)
                    .values({ user_id: userId, ...parsedQuiz })
                    .returning({ id: quizzesTable.id });

                parsedCards.forEach(async (card) => {
                    if (!quizId) {
                        throw new Error("Quiz id is undefined");
                    }
                    await tr
                        .insert(quizCardsTable)
                        .values({ quiz_id: quizId.id, ...card });
                });

                if (languageISOCodes) {
                    for (const isoCode of languageISOCodes) {
                        const [languageId] = await tr
                            .select({ id: languagesTable.id })
                            .from(languagesTable)
                            .where(eq(languagesTable.iso_code, isoCode));

                        if (!languageId) {
                            const err = new Error(
                                `Language ${isoCode} not found`
                            );
                            err.cause = "language";
                            throw err;
                        }

                        await tr.insert(quizLanguagesTable).values({
                            language_id: languageId.id,
                            quiz_id: quizId.id,
                        });
                    }
                }

                if (tags) {
                    for (const tag of tags) {
                        const [tagId] = await tr
                            .select({ id: tagsTable.id })
                            .from(tagsTable)
                            .where(eq(tagsTable.name, tag));

                        if (!tagId) {
                            const err = new Error(`Tag ${tag} not found`);
                            err.cause = "tag";
                            throw err;
                        }

                        await tr
                            .insert(quizTagsTable)
                            .values({ tag_id: tagId.id, quiz_id: quizId.id });
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

            if (status === 500) {
                throw e;
            }

            const res = {
                message: "Nem sikerült publikálni a kvízt",
                error: {
                    message: errMessage,
                    case: "server",
                },
            } satisfies ApiResponse;
            return c.json(res, status);
        }

        if (!quizId) {
            throw new Error("Quiz id is undefined");
        }
        const res = {
            message: "Kvíz publikálva",
            data: quizId,
        } satisfies ApiResponse;

        return c.json(res, 201);
    }
);

export default publishHandlers;
