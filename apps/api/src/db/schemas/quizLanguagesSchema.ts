import { uniqueIndex, integer, pgTable, uuid } from "drizzle-orm/pg-core";
import { quizzesTable } from "./quizzesSchema";
import { languagesTable } from "./languagesSchema";
import { relations } from "drizzle-orm";


export const quizLanguagesTable = pgTable("quiz_languages", {
    quiz_id: uuid().notNull().references(() => quizzesTable.id, { onDelete: 'cascade' }),
    language_id: integer().notNull().references(() => languagesTable.id, { onDelete: 'cascade' }),
}, (table) => {
    return [
        uniqueIndex().on(table.quiz_id, table.language_id),
    ];
});

export const quizLanguagesRelations = relations(quizLanguagesTable, ({ one }) => ({
    quiz: one(quizzesTable, {
        fields: [quizLanguagesTable.quiz_id],
        references: [quizzesTable.id],
    }),
    language: one(languagesTable, {
        fields: [quizLanguagesTable.language_id],
        references: [languagesTable.id],
    }),
}));
