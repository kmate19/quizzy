import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, serial, index, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema";

export const userStatsTable = pgTable("user_stats", {
    id: serial().primaryKey(),
    user_id: uuid().notNull().references(() => usersTable.id),
    plays: integer().notNull().default(0),
    first_places: integer().notNull().default(0),
    second_places: integer().notNull().default(0),
    third_places: integer().notNull().default(0),
    wins: integer().notNull().default(0),
    losses: integer().notNull().default(0),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        index().on(table.user_id),];
});

export type UserStats = typeof userStatsTable.$inferInsert;

export const userStatsRelations = relations(userStatsTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [userStatsTable.user_id],
        references: [usersTable.id],
    }),
}));
