import { relations } from "drizzle-orm";
import {
    index,
    integer,
    pgEnum,
    pgTable,
    smallint,
    timestamp,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";
import { quizzesTable } from "./quizzesSchema";
import { bytea } from "./customTypes";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const quizTypeEnum = pgEnum("quiz_type", ["normal", "twochoice"]);

export const quizCardsTable = pgTable(
    "quiz_cards",
    {
        id: integer().generatedAlwaysAsIdentity().primaryKey(),
        quiz_id: uuid()
            .notNull()
            .references(() => quizzesTable.id, { onDelete: "cascade" }),
        type: quizTypeEnum().notNull(),
        question: varchar({ length: 255 }).notNull(),
        answers: varchar({ length: 255 }).array().notNull(),
        picture: bytea().notNull(),
        correct_answer_index: smallint().notNull(),
        created_at: timestamp().notNull().defaultNow(),
        updated_at: timestamp()
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => {
        return [index().on(table.quiz_id), index().on(table.question)];
    }
);

export type QuizCard = typeof quizCardsTable.$inferInsert;

export const insertQuizCardsSchema = createInsertSchema(quizCardsTable)
    .omit({
        quiz_id: true,
        created_at: true,
        updated_at: true,
    })
    .extend({
        picture: z.string(),
    });

export const quizCardsRelations = relations(quizCardsTable, ({ one }) => ({
    quiz: one(quizzesTable, {
        fields: [quizCardsTable.quiz_id],
        references: [quizzesTable.id],
    }),
}));
