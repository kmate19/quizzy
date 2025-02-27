import {
    integer,
    pgTable,
    timestamp,
    uniqueIndex,
    varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { quizTagsTable } from "./quizTagsSchema";

export const tagsTable = pgTable(
    "tags",
    {
        id: integer().generatedAlwaysAsIdentity().primaryKey(),
        name: varchar({ length: 24 }).notNull().unique(),
        created_at: timestamp().notNull().defaultNow(),
        updated_at: timestamp()
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => {
        return [uniqueIndex().on(table.name)];
    }
);

export type Tag = typeof tagsTable.$inferSelect;
export type TagInsert = typeof tagsTable.$inferInsert;

export const tagsRelations = relations(tagsTable, ({ many }) => ({
    quizzes: many(quizTagsTable),
}));
