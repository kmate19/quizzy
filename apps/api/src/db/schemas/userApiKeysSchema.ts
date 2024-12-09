import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, serial, index, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema.ts";
import { resourceAccessControlTable } from "./resourceAccessControlSchema.ts";

export const userApiKeys = pgTable("user_api_keys", {
    id: serial().primaryKey(),
    user_id: uuid().notNull().references(() => usersTable.id),
    // hashed argon2
    key: varchar({ length: 255 }).notNull().unique(),
    description: varchar({ length: 255 }),
    access_permissions: serial().notNull().references(() => resourceAccessControlTable.id),
    expires_at: timestamp().notNull(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        index().on(table.access_permissions),
    ];
});

export type UserApiKey = typeof userApiKeys.$inferInsert;

export const userApiKeyRelations = relations(userApiKeys, ({ one, many }) => ({
    user: one(usersTable, {
        fields: [userApiKeys.user_id],
        references: [usersTable.id],
    }),
    access_permissions: many(resourceAccessControlTable),
}));
