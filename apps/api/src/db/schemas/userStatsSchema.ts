import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, index, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema";

export const userStatsTable = pgTable(
    "user_stats",
    {
        id: integer().generatedAlwaysAsIdentity().primaryKey(),
        user_id: uuid()
            .notNull()
            .references(() => usersTable.id, { onDelete: "cascade" }),
        plays: integer().notNull().default(0),
        first_places: integer().notNull().default(0),
        second_places: integer().notNull().default(0),
        third_places: integer().notNull().default(0),
        correct_answers: integer().notNull().default(0),
        wrong_answers: integer().notNull().default(0),
        created_at: timestamp().notNull().defaultNow(),
        updated_at: timestamp()
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => {
        return [index().on(table.user_id)];
    }
);

export type UserStatsInsert = typeof userStatsTable.$inferInsert;
export type UserStats = typeof userStatsTable.$inferSelect;
export const UserStatsInferSelectRaw = userStatsTable.$inferSelect;

export const userStatsRelations = relations(userStatsTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [userStatsTable.user_id],
        references: [usersTable.id],
    }),
}));
