import { relations } from "drizzle-orm";
import { customType, integer, pgEnum, pgTable, real, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema.ts";
import { quizCardsTable } from "./quizCardsSchema.ts";
import { reviewsTable } from "./reviewsSchema.ts";
import { languagesTable } from "./languagesSchema.ts";

export const quizStatusEnum = pgEnum("quiz_status", ["draft", "published", "requires_review", "private"]);

// not builtin to drizzle yet
const bytea = customType<{ data: Buffer, default: false }>(
    {
        dataType() {
            return 'bytea';
        }
    }
);

export const quizzesTable = pgTable("quizzes", {
    id: uuid().primaryKey(),
    user_id: uuid().notNull().references(() => usersTable.id),
    title: varchar({ length: 24 }).notNull().unique(),
    description: varchar({ length: 255 }).notNull(),
    status: quizStatusEnum().notNull().default("draft"),
    rating: real().notNull().default(0),
    plays: integer().notNull().default(0),
    banner: bytea().notNull(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        uniqueIndex().on(table.title),
    ];
});

export type Quiz = typeof quizzesTable.$inferInsert;

export const quizzesRelations = relations(quizzesTable, ({ one, many }) => ({
    user: one(usersTable, {
        fields: [quizzesTable.user_id],
        references: [usersTable.id],
    }),
    cards: many(quizCardsTable),
    reviews: many(reviewsTable),
    languages: many(languagesTable)
    // TODO: add these tables
    // tags: many(tagsTable)
}));
