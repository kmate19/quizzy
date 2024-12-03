import { relations } from "drizzle-orm";
import { text, pgTable, timestamp, uuid, serial } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema.ts";

export const userTokensTable = pgTable("user_tokens", {
    id: serial().primaryKey(),
    user_id: uuid().notNull().references(() => usersTable.id),
    refresh_token: text().notNull(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
});

export type UserTokens = typeof userTokensTable.$inferInsert;

export const userTokensRelations = relations(userTokensTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [userTokensTable.user_id],
        references: [usersTable.id],
    }),
}));
