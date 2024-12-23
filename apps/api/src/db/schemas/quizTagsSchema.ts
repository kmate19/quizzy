import { pgTable, serial, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { quizzesTable } from "./quizzesSchema.ts";
import { tagsTable } from "./tagsSchema.ts";
import { relations } from "drizzle-orm";

export const quizTagsTable = pgTable("quiz_tags", {
    quiz_id: uuid().notNull().references(() => quizzesTable.id),
    tag_id: serial().notNull().references(() => tagsTable.id),
}, (table) => {
    return [
        uniqueIndex().on(table.tag_id),
        uniqueIndex().on(table.quiz_id),
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
