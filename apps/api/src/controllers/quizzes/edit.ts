import GLOBALS from "@/config/globals";
import db from "@/db";
import {
    insertQuizCardsSchema,
    insertQuizSchema,
    languagesTable,
    QuizCard,
    quizCardsTable,
    quizLanguagesTable,
    quizTagsTable,
    quizzesTable,
    tagsTable,
} from "@/db/schemas";
import checkJwt from "@/middlewares/check-jwt";
import { zv } from "@/middlewares/zv";
import { makeSharpImage } from "@/utils/helpers";
import { and, eq } from "drizzle-orm";
import { fileTypeFromBuffer } from "file-type";
import { ApiResponse } from "repo";
import { z } from "zod";

const editHandlers = GLOBALS.CONTROLLER_FACTORY(
    checkJwt(),
    zv(
        "json",
        z.object({
            quiz: insertQuizSchema.optional(),
            cards: insertQuizCardsSchema.array().min(1).max(10).optional(),
            languageISOCodes: z.string().length(2).array().optional(),
            tags: z.string().array().optional(),
        })
    ),
    zv("param", z.object({ quizId: z.string().uuid() })),
    async (c) => {
        const { quizId } = c.req.valid("param");
        const { userId } = c.get("accessTokenPayload");

        const {
            quiz: modifiedQuiz,
            cards: newCards,
            languageISOCodes: newLanguageISOCodes,
            tags: newTags,
        } = c.req.valid("json");

        if (!modifiedQuiz && !newCards && !newLanguageISOCodes && !newTags) {
            const res = {
                message: "No changes",
                error: {
                    message: "no_changes",
                    case: "bad_request",
                },
            } satisfies ApiResponse;

            return c.json(res, 400);
        }

        const quiz = await db.query.quizzesTable.findFirst({
            where: and(
                eq(quizzesTable.id, quizId),
                eq(quizzesTable.user_id, userId)
            ),
            with: {
                cards: true,
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
                                iso_code: true,
                            },
                        },
                    },
                },
            },
        });

        if (!quiz) {
            const res = {
                message: "Quiz not found",
                error: {
                    message: "quiz_not_found",
                    case: "not_found",
                },
            } satisfies ApiResponse;

            return c.json(res, 404);
        }

        if (modifiedQuiz) {
            let parsedNewQuiz;
            try {
                const rawFileBuf = Buffer.from(
                    modifiedQuiz.banner.split(";base64,")[1],
                    "base64"
                );
                const fileInfoRaw = await fileTypeFromBuffer(rawFileBuf);

                if (!fileInfoRaw || !fileInfoRaw.mime.startsWith("image/")) {
                    const res = {
                        message: "Invalid file type",
                        error: {
                            message: "invalid_file_type",
                            case: "bad_request",
                        },
                    } satisfies ApiResponse;

                    return c.json(res, 400);
                }

                if (rawFileBuf.length > 1024 * 1024) {
                    const res = {
                        message: "File too large maximum 1MB",
                        error: {
                            message: "file_too_large",
                            case: "bad_request",
                        },
                    };

                    return c.json(res, 400);
                }

                const parsedBanner = await makeSharpImage(rawFileBuf);

                parsedNewQuiz = {
                    ...modifiedQuiz,
                    banner: parsedBanner,
                };
            } catch (e) {
                console.error(e);
                const res = {
                    message: "Failed to publish quiz (banner)",
                    error: {
                        message: "Failed to publish quiz (banner)",
                        case: "bad_request",
                    },
                } satisfies ApiResponse;
                return c.json(res, 400);
            }

            Object.entries(parsedNewQuiz).reduce((acc, [key, value]) => {
                if (quiz[key as keyof typeof quiz] !== value) {
                    if (value instanceof Buffer) {
                        if (
                            value.toString("base64") ===
                            (quiz[key as keyof typeof quiz] as Buffer).toString(
                                "base64"
                            )
                        ) {
                            return acc;
                        }
                    }
                    // @ts-expect-error impossible to type reduce idc
                    acc[key] = value;
                }
                return acc;
            }, quiz);
        }

        const newParsedCards: Omit<QuizCard, "quiz_id">[] = [];
        if (newCards) {
            if (newCards.length >= 10) {
                const res = {
                    message: "Quiz has too many cards Max 10",
                    error: {
                        message: "quiz_has_too_many_cards",
                        case: "bad_request",
                    },
                } satisfies ApiResponse;

                return c.json(res, 400);
            }

            try {
                for (const card of newCards) {
                    const rawFileBuf = Buffer.from(
                        card.picture.split(";base64,")[1],
                        "base64"
                    );
                    const fileInfoRaw = await fileTypeFromBuffer(rawFileBuf);

                    if (
                        !fileInfoRaw ||
                        !fileInfoRaw.mime.startsWith("image/")
                    ) {
                        const res = {
                            message: "Invalid file type",
                            error: {
                                message: "invalid_file_type",
                                case: "bad_request",
                            },
                        } satisfies ApiResponse;

                        return c.json(res, 400);
                    }

                    if (rawFileBuf.length > 1024 * 1024) {
                        const res = {
                            message: "File too large maximum 1MB",
                            error: {
                                message: "file_too_large",
                                case: "bad_request",
                            },
                        };

                        return c.json(res, 400);
                    }
                    newParsedCards.push({
                        ...card,
                        picture: await makeSharpImage(
                            Buffer.from(
                                card.picture.split(";base64,")[1],
                                "base64"
                            )
                        ),
                    });
                }
            } catch (e) {
                console.error("QUIZ EDIT ERROR (CARDS)", e);
                const res = {
                    message: "Failed to publish quiz (cards)",
                    error: {
                        message: "Failed to publish quiz (cards)",
                        case: "bad_request",
                    },
                };
                return c.json(res, 400);
            }
        }

        try {
            await db.transaction(async (tr) => {
                await tr
                    .update(quizzesTable)
                    .set({ ...quiz })
                    .where(
                        and(
                            eq(quizzesTable.id, quizId),
                            eq(quizzesTable.user_id, userId)
                        )
                    );

                if (newCards) {
                    await tr
                        .delete(quizCardsTable)
                        .where(eq(quizCardsTable.quiz_id, quizId));
                    newParsedCards.forEach(async (card) => {
                        await tr
                            .insert(quizCardsTable)
                            .values({ quiz_id: quizId, ...card });
                    });
                }

                if (newLanguageISOCodes) {
                    for (const isoCode of newLanguageISOCodes) {
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

                        await tr
                            .insert(quizLanguagesTable)
                            .values({
                                language_id: languageId.id,
                                quiz_id: quizId,
                            })
                            .onConflictDoNothing();
                    }
                }

                if (newTags) {
                    for (const tag of newTags) {
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
                            .values({ tag_id: tagId.id, quiz_id: quizId });
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
                message: "Failed to publish quiz",
                error: {
                    message: errMessage,
                    case: "server",
                },
            } satisfies ApiResponse;
            return c.json(res, status);
        }

        const res = {
            message: "Quiz updated",
            data: quizId,
        } satisfies ApiResponse;

        return c.json(res, 200);
    }
);

export default editHandlers;
