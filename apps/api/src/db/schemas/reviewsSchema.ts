import { integer, real, pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema.ts";
import { quizzesTable } from "./quizzesSchema.ts";
import { relations } from "drizzle-orm";


export const reviewsTable = pgTable("reviews", {
    id: uuid().primaryKey(),
    user_id: uuid().notNull().references(() => usersTable.id),
    quiz_id: uuid().notNull().references(() => quizzesTable.id),
    rating: real().notNull(),
    likes: integer().notNull().default(0),
    dislikes: integer().notNull().default(0),
    comment: varchar({ length: 255 }).notNull(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        index().on(table.user_id),
        index().on(table.quiz_id)
    ];
});

export const reviewsRelations = relations(reviewsTable, ({ one }) => ({
    quiz: one(quizzesTable, {
        fields: [reviewsTable.quiz_id],
        references: [quizzesTable.id],
    }),
    user: one(usersTable, {
        fields: [reviewsTable.user_id],
        references: [usersTable.id],
    })
}));
