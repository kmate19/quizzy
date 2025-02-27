import { relations } from "drizzle-orm";
import {
    uniqueIndex,
    pgTable,
    timestamp,
    varchar,
    pgEnum,
    integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { quizLanguagesTable } from "./quizLanguagesSchema";

export const languageSupportEnum = pgEnum("language_support", [
    "official",
    "partial",
    "none",
]);

export const languagesTable = pgTable(
    "languages",
    {
        id: integer().generatedAlwaysAsIdentity().primaryKey(),
        name: varchar({ length: 24 }).notNull().unique(),
        iso_code: varchar({ length: 2 }).notNull().unique(),
        icon: varchar({ length: 24 }).notNull().unique(),
        support: languageSupportEnum().notNull().default("none"),
        created_at: timestamp().notNull().defaultNow(),
        updated_at: timestamp()
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => {
        return [
            uniqueIndex().on(table.name),
            uniqueIndex().on(table.iso_code),
            uniqueIndex().on(table.icon),
        ];
    }
);

export type Language = typeof languagesTable.$inferSelect;
export type LanguageInsert = typeof languagesTable.$inferInsert;

export const insertLanguageSchema = createInsertSchema(languagesTable).omit({
    created_at: true,
    updated_at: true,
    name: true,
    icon: true,
    support: true,
});

export const languagesRelations = relations(languagesTable, ({ many }) => ({
    quizzes: many(quizLanguagesTable),
}));
