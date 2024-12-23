import { pgTable, serial, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { quizzesTable } from "./quizzesSchema.ts";
import { relations } from "drizzle-orm";

export const tagsTable = pgTable("tags", {
    id: serial().primaryKey(),
    name: varchar({ length: 24 }).notNull().unique(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        uniqueIndex().on(table.name),
    ];
});

export const tagsRelations = relations(tagsTable, ({ many }) => ({
    quizzes: many(quizzesTable)
}));
