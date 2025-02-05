import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, real, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema";
import { quizCardsTable } from "./quizCardsSchema";
import { reviewsTable } from "./reviewsSchema";
import { languagesTable } from "./languagesSchema";
import { tagsTable } from "./tagsSchema";
import { bytea } from "./customTypes";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const quizStatusEnum = pgEnum("quiz_status", ["draft", "published", "requires_review", "private"]);

export const quizzesTable = pgTable("quizzes", {
    id: uuid().defaultRandom().primaryKey(),
    user_id: uuid().notNull().references(() => usersTable.id),
    title: varchar({ length: 24 }).notNull().unique(),
    description: varchar({ length: 255 }).notNull(),
    status: quizStatusEnum().notNull(),
    rating: real().notNull().default(0),
    plays: integer().notNull().default(0),
    banner: bytea().notNull(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        uniqueIndex().on(table.title),
    ];
});

export type Quiz = typeof quizzesTable.$inferInsert;

export const insertQuizSchema = createInsertSchema(quizzesTable).omit({
    id: true,
    user_id: true,
    created_at: true,
    updated_at: true,
    rating: true,
    plays: true,
}).extend({
    banner: z.string().base64(),
});

export const quizzesRelations = relations(quizzesTable, ({ one, many }) => ({
    user: one(usersTable, {
        fields: [quizzesTable.user_id],
        references: [usersTable.id],
    }),
    cards: many(quizCardsTable),
    reviews: many(reviewsTable),
    languages: many(languagesTable),
    tags: many(tagsTable)
}));
