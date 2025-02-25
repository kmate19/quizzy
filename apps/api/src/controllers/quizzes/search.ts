import GLOBALS from "@/config/globals";
import db from "@/db";
import {
    languagesTable,
    quizLanguagesTable,
    quizTagsTable,
    quizzesTable,
    tagsTable,
} from "@/db/schemas";
import { apikey_or_jwt } from "@/middlewares/check-composite";
import { zv } from "@/middlewares/zv";
import { pagination } from "@/utils/schemas/zod-schemas";
import { and, countDistinct, eq, exists, inArray, SQL, sql } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { Context } from "hono";
import type { ApiResponse } from "repo";
import { z } from "zod";

function createSubquery<
    T extends typeof quizTagsTable | typeof quizLanguagesTable,
>(table: T, compArray: number[], strict: boolean) {
    if (table === quizTagsTable) {
        const inner = db
            .select({
                quizId: table.quiz_id,
            })
            .from(table as PgTable)
            .where(
                and(
                    sql`${table.quiz_id} = "quizzesTable"."id"`,
                    inArray(table.tag_id, compArray)
                )
            );

        if (strict) {
            inner
                .groupBy(table.quiz_id)
                .having(eq(countDistinct(table.tag_id), compArray.length));
        }

        return exists(inner);
    } else if (table === quizLanguagesTable) {
        const inner = db
            .select({
                quizId: table.quiz_id,
            })
            .from(table as PgTable)
            .where(
                and(
                    sql`${table.quiz_id} = "quizzesTable"."id"`,
                    inArray(table.language_id, compArray)
                )
            );

        if (strict) {
            inner
                .groupBy(table.quiz_id)
                .having(eq(countDistinct(table.language_id), compArray.length));
        }
        return exists(inner);
    }
}

async function checkFilters(
    tableName: string,
    type: string,
    filter: string,
    c: Context,
    outArray: number[]
) {
    console.log(tableName, type, filter);
    // @ts-expect-error mivan ???dajklfklfajkjklflkj

    const tagId = await db.query[tableName].findFirst({
        where: eq(
            tableName === "languagesTable"
                ? languagesTable.iso_code
                : tagsTable.name,
            filter
        ),
        columns: {
            id: true,
        },
    });

    if (!tagId) {
        const res = {
            message: `${type} not found: ${filter}`,
            error: {
                message: `${type} not found`,
                case: "bad_request",
            },
        } satisfies ApiResponse;
        return c.json(res, 404);
    }

    outArray.push(tagId.id);
}

const searchHandlers = GLOBALS.CONTROLLER_FACTORY(
    apikey_or_jwt(),
    zv(
        "query",
        pagination.merge(
            z.object({
                query: z.string().nonempty().optional(),
                tags: z
                    .string()
                    .nonempty()
                    .array()
                    .optional()
                    .or(z.string().nonempty().optional()),
                languages: z
                    .string()
                    .nonempty()
                    .array()
                    .optional()
                    .or(z.string().nonempty().optional()),
                strict: z
                    .string()
                    .transform((a) => {
                        return a === "true" ? true : false;
                    })
                    .optional(),
            })
        )
    ),
    async (c) => {
        const { query, tags, languages } = c.req.valid("query");

        const limit = c.req.valid("query").limit || 20;
        const page = c.req.valid("query").page || 1;
        const strict = c.req.valid("query").strict || false;

        const offset = limit * (page - 1);

        let tsRankOrderBy;
        let queryWhereClause;
        if (query) {
            tsRankOrderBy = sql`
            ts_rank(
                setweight(to_tsvector('english', unaccent(title)), 'A') ||
                setweight(to_tsvector('english', unaccent(coalesce(description, ''))), 'B'),
                plainto_tsquery('english', unaccent(${query}))
            ) DESC, similarity(unaccent(title), unaccent(${query})) DESC
        `;

            queryWhereClause = sql`
            (
                to_tsvector('english', unaccent(title)) ||
                to_tsvector('english', unaccent(coalesce(description, ''))) @@ 
                plainto_tsquery('english', unaccent(${query}))
                OR similarity(unaccent(title), unaccent(${query})) > 0.65 -- Trigram match
            )
        `;
        }

        let quizTagsSubquery: SQL | undefined = undefined;
        if (tags) {
            const idsOfTags: number[] = [];
            if (tags instanceof Array) {
                for (const tag of tags) {
                    const maybeErr = await checkFilters(
                        "tagsTable",
                        "Tag",
                        tag,
                        c,
                        idsOfTags
                    );

                    if (maybeErr) {
                        return maybeErr;
                    }
                }
            } else {
                const maybeErr = await checkFilters(
                    "tagsTable",
                    "Tag",
                    tags,
                    c,
                    idsOfTags
                );

                if (maybeErr) {
                    return maybeErr;
                }
            }

            if (idsOfTags.length !== 0) {
                quizTagsSubquery = createSubquery(
                    quizTagsTable,
                    idsOfTags,
                    strict
                );
            }
        }

        let quizLanguagesSubquery: SQL | undefined = undefined;
        if (languages) {
            const idsOfLanguages: number[] = [];
            if (languages instanceof Array) {
                for (const language of languages) {
                    const maybeErr = await checkFilters(
                        "languagesTable",
                        "Language",
                        language,
                        c,
                        idsOfLanguages
                    );

                    if (maybeErr) {
                        return maybeErr;
                    }
                }
            } else {
                const maybeErr = await checkFilters(
                    "languagesTable",
                    "Language",
                    languages,
                    c,
                    idsOfLanguages
                );

                if (maybeErr) {
                    return maybeErr;
                }
            }

            if (idsOfLanguages.length !== 0) {
                quizLanguagesSubquery = createSubquery(
                    quizLanguagesTable,
                    idsOfLanguages,
                    strict
                );
            }
        }

        const quizzesWCount = await db.query.quizzesTable.findMany({
            extras: {
                totalCount: sql<number>`COUNT(*) OVER()`.as("total_count"),
            },
            with: {
                user: {
                    columns: {
                        username: true,
                    },
                },
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
            offset,
            limit,
            where: and(
                eq(quizzesTable.status, "published"),
                queryWhereClause,
                quizTagsSubquery,
                quizLanguagesSubquery
            ),
            orderBy: tsRankOrderBy,
        });

        const totalCount = quizzesWCount[0]?.totalCount || 0;

        // eslint-disable-next-line
        const quizzes = quizzesWCount.map(({ totalCount, ...rest }) => rest);

        console.log(quizzes);

        const res = {
            message: "search results",
            data: { quizzes, totalCount },
        } satisfies ApiResponse;

        return c.json(res, 200);
    }
);

export default searchHandlers;
