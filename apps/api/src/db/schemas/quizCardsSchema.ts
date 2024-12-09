import { relations } from "drizzle-orm";
import { index, pgTable, serial, smallint, timestamp, varchar } from "drizzle-orm/pg-core";
import { quizzesTable } from "./quizzesSchema.ts";

export const quizCardsTable = pgTable("quiz_cards", {
    id: serial().primaryKey(),
    quiz_id: serial().notNull().references(() => quizzesTable.id),
    question: varchar({ length: 255 }).notNull(),
    answer: varchar({ length: 255 }).notNull(),
    correct_answer_index: smallint().notNull(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        index().on(table.quiz_id),
        index().on(table.question),
    ];
});

export type QuizCard = typeof quizCardsTable.$inferInsert;

export const quizCardsRelations = relations(quizCardsTable, ({ one }) => ({
    quiz: one(quizzesTable, {
        fields: [quizCardsTable.quiz_id],
        references: [quizzesTable.id],
    }),
}));
