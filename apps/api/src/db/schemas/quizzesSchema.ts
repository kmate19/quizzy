import { relations, sql } from "drizzle-orm";
import { pgEnum, pgTable, serial, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema.ts";
import { quizCardsTable } from "./quizCardsSchema.ts";

export const quizStatusEnum = pgEnum("quiz_status", ["draft", "published", "requires_review"]);

export const quizzesTable = pgTable("quizzes", {
    id: serial().primaryKey(),
    userId: uuid().notNull().references(() => usersTable.id),
    title: varchar({ length: 24 }).notNull(),
    description: varchar({ length: 255 }).notNull(),
    status: quizStatusEnum().notNull().default("draft"),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export type Quiz = typeof quizzesTable.$inferInsert;

export const quizzesRelations = relations(quizzesTable, ({ one, many }) => ({
    user: one(usersTable, {
        fields: [quizzesTable.userId],
        references: [usersTable.id],
    }),
    cards: many(quizCardsTable)
}));
