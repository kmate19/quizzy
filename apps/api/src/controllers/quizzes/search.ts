import GLOBALS from "@/config/globals";
import db from "@/db";
import { quizzesTable } from "@/db/schemas";
import { apikey_or_jwt } from "@/middlewares/check-composite";
import { zv } from "@/middlewares/zv";
import { numericString } from "@/utils/schemas/zod-schemas";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

const searchHandlers = GLOBALS.CONTROLLER_FACTORY(
    apikey_or_jwt(),
    zv(
        "query",
        z.object({
            query: z.string().nonempty().optional(),
            tags: z.string().nonempty().array().optional(),
            languages: z.string().nonempty().array().optional(),
            limit: numericString
                .refine((num) => num < 51 && num > 9)
                .optional(),
            page: numericString.optional(),
        })
    ),
    async (c) => {
        const { query, tags, languages } = c.req.valid("query");

        const limit = c.req.valid("query").limit || 20;
        const page = c.req.valid("query").page || 1;

        const offset = limit * (page - 1);

        const tsRankOrderBy = sql`
            ts_rank(
                setweight(to_tsvector('english', unaccent(title)), 'A') ||
                setweight(to_tsvector('english', unaccent(coalesce(description, ''))), 'B'),
                to_tsquery('english', unaccent(${query}) || ':*')
            ) DESC
        `;

        const whereClause = sql`
            (
                to_tsvector('english', unaccent(title)) ||
                to_tsvector('english', unaccent(coalesce(description, ''))) @@ 
                to_tsquery('english', unaccent(${query}) || ':*')
                OR unaccent(title) % unaccent(${query}) -- Trigram match
            )
        `;

        const quizzes = await db
            .select()
            .from(quizzesTable)
            .offset(offset)
            .limit(limit)
            .where(and(eq(quizzesTable.status, "published"), whereClause))
            .orderBy(tsRankOrderBy);

        console.log(quizzes);

        return c.json(quizzes);
    }
);

export default searchHandlers;
