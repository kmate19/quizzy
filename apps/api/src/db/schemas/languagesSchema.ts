import { relations } from "drizzle-orm";
import { uniqueIndex, pgTable, serial, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";
import { quizzesTable } from "./quizzesSchema.ts";

export const languageSupportEnum = pgEnum("language_support", ["official", "partial", "none"]);

export const languagesTable = pgTable("languages", {
    id: serial().primaryKey(),
    name: varchar({ length: 24 }).notNull().unique(),
    iso_code: varchar({ length: 2 }).notNull().unique(),
    icon: varchar({ length: 24 }).notNull().unique(),
    support: languageSupportEnum().notNull().default("none"),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        uniqueIndex().on(table.name),
        uniqueIndex().on(table.iso_code),
        uniqueIndex().on(table.icon),
    ];
});

export const languagesRelations = relations(languagesTable, ({ many }) => ({
    quizzes: many(quizzesTable)
}));
