import { integer, pgTable, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { quizzesTable } from "./quizzesSchema";
import { tagsTable } from "./tagsSchema";
import { relations } from "drizzle-orm";

export const quizTagsTable = pgTable("quiz_tags", {
    quiz_id: uuid().notNull().references(() => quizzesTable.id, { onDelete: 'cascade' }),
    tag_id: integer().notNull().references(() => tagsTable.id, { onDelete: 'cascade' }),
}, (table) => {
    return [
        uniqueIndex().on(table.quiz_id, table.tag_id),
    ];
});

export const quizTagsRelations = relations(quizTagsTable, ({ one }) => ({
    quiz: one(quizzesTable, {
        fields: [quizTagsTable.quiz_id],
        references: [quizzesTable.id],
    }),
    tag: one(tagsTable, {
        fields: [quizTagsTable.tag_id],
        references: [tagsTable.id],
    })
}));
