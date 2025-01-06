import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, serial, index, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema.ts";
import { resourceAccessControlTable } from "./resourceAccessControlSchema.ts";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userApiKeys = pgTable("user_api_keys", {
    id: serial().primaryKey(),
    user_id: uuid().notNull().references(() => usersTable.id),
    // hashed bcrypt
    key: varchar({ length: 255 }).notNull().unique(),
    description: varchar({ length: 255 }),
    //access_permissions: integer().notNull().references(() => resourceAccessControlTable.id),
    expires_at: timestamp({ mode: "string" }).notNull(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        index().on(table.description)
    ];
});

export type UserApiKey = typeof userApiKeys.$inferInsert;


// TODO: finish this with actual resourceAccessControl

export const postApiKeySchema = createInsertSchema(userApiKeys)
    .pick({ description: true, expires_at: true })
    .extend({ expires_at: z.string().datetime() });

export const userApiKeyRelations = relations(userApiKeys, ({ one, many }) => ({
    user: one(usersTable, {
        fields: [userApiKeys.user_id],
        references: [usersTable.id],
    }),
    access_permissions: many(resourceAccessControlTable),
}));
