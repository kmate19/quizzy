import {
    pgTable,
    serial,
    timestamp,
    uniqueIndex,
    varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { quizTagsTable } from "./quizTagsSchema";

export const tagsTable = pgTable(
    "tags",
    {
        id: serial().primaryKey(),
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

export type Tag = typeof tagsTable.$inferInsert;

export const insertTagSchema = createInsertSchema(tagsTable).omit({
    id: true,
    created_at: true,
    updated_at: true,
});

export const tagsRelations = relations(tagsTable, ({ many }) => ({
    quizzes: many(quizTagsTable),
}));
