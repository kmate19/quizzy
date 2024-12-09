import { relations } from "drizzle-orm";
import { pgEnum, pgTable, serial, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema.ts";
import { quizCardsTable } from "./quizCardsSchema.ts";

export const quizStatusEnum = pgEnum("quiz_status", ["draft", "published", "requires_review"]);

export const quizzesTable = pgTable("quizzes", {
    id: serial().primaryKey(),
    user_id: uuid().notNull().references(() => usersTable.id),
    title: varchar({ length: 24 }).notNull().unique(),
    description: varchar({ length: 255 }).notNull(),
    status: quizStatusEnum().notNull().default("draft"),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        uniqueIndex().on(table.title),
    ];
});

export type Quiz = typeof quizzesTable.$inferInsert;

export const quizzesRelations = relations(quizzesTable, ({ one, many }) => ({
    user: one(usersTable, {
        fields: [quizzesTable.user_id],
        references: [usersTable.id],
    }),
    cards: many(quizCardsTable)
}));
