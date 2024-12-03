import { relations, sql } from "drizzle-orm";
import { text, pgTable, timestamp, uuid, serial } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema.ts";

export const userTokensTable = pgTable("user_tokens", {
    id: serial().primaryKey(),
    userId: uuid().notNull().references(() => usersTable.id),
    refreshToken: text().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export const userTokensRelations = relations(userTokensTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [userTokensTable.userId],
        references: [usersTable.id],
    }),
}));
