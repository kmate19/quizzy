import { relations, sql } from "drizzle-orm";
import { pgTable, serial, smallint, timestamp, varchar } from "drizzle-orm/pg-core";
import { quizzesTable } from "./quizzesSchema.ts";

export const quizCardsTable = pgTable("quiz_cards", {
    id: serial().primaryKey(),
    quizId: serial().notNull().references(() => quizzesTable.id),
    question: varchar({ length: 255 }).notNull(),
    answer: varchar({ length: 255 }).notNull(),
    correctAnswerIndex: smallint().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export type QuizCard = typeof quizCardsTable.$inferInsert;

export const quizCardsRelations = relations(quizCardsTable, ({ one }) => ({
    quiz: one(quizzesTable, {
        fields: [quizCardsTable.quizId],
        references: [quizzesTable.id],
    }),
}));
