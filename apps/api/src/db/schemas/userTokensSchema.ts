import { relations } from "drizzle-orm";
import { text, pgTable, timestamp, uuid, serial, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema";

export const tokenTypeEnum = pgEnum("token_type", ["email", "refresh", "forgot_password"]);

export const userTokensTable = pgTable("user_tokens", {
    id: serial().primaryKey(),
    user_id: uuid().notNull().references(() => usersTable.id),
    token: text().notNull().unique(),
    token_type: tokenTypeEnum().notNull(),
    data: text(),
    expires_at: timestamp().notNull(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        uniqueIndex().on(table.token),
    ];
});

export type UserTokens = typeof userTokensTable.$inferInsert;

export const userTokensRelations = relations(userTokensTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [userTokensTable.user_id],
        references: [usersTable.id],
    }),
}));
