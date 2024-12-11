import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, serial, index, varchar, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema.ts";
import { resourceAccessControlTable } from "./resourceAccessControlSchema.ts";
import { createInsertSchema } from "drizzle-zod";

export const userApiKeys = pgTable("user_api_keys", {
    id: serial().primaryKey(),
    user_id: uuid().notNull().references(() => usersTable.id),
    // hashed argon2
    key: varchar({ length: 255 }).notNull().unique(),
    description: varchar({ length: 255 }),
    access_permissions: integer().notNull().references(() => resourceAccessControlTable.id),
    expires_at: timestamp().notNull(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        index().on(table.description)
    ];
});

export type UserApiKey = typeof userApiKeys.$inferInsert;

export const postApiKeySchema = createInsertSchema(userApiKeys).pick({ user_id: true, key: true, description: true, access_permissions: true, expires_at: true });

export const userApiKeyRelations = relations(userApiKeys, ({ one, many }) => ({
    user: one(usersTable, {
        fields: [userApiKeys.user_id],
        references: [usersTable.id],
    }),
    access_permissions: many(resourceAccessControlTable),
}));
