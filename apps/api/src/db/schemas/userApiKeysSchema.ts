import { relations } from "drizzle-orm";
import {
    pgTable,
    timestamp,
    uuid,
    serial,
    index,
    varchar,
    integer,
} from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema";
import { resourceAccessControlTable } from "./resourceAccessControlSchema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userApiKeys = pgTable(
    "user_api_keys",
    {
        id: serial().primaryKey(),
        // increment each time a user creates a new key under their own uuid
        id_by_user: integer().notNull(),
        user_id: uuid()
            .notNull()
            .references(() => usersTable.id, { onDelete: "cascade" }),
        // hashed bcrypt
        key: varchar({ length: 255 }).notNull().unique(),
        description: varchar({ length: 255 }),
        //access_permissions: integer().notNull().references(() => resourceAccessControlTable.id),
        expires_at: timestamp().notNull(),
        created_at: timestamp().notNull().defaultNow(),
        updated_at: timestamp()
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => {
        return [index().on(table.description)];
    }
);

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
