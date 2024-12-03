import { relations, sql } from "drizzle-orm";
import { text, pgTable, timestamp, serial, varchar, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema.ts";
import { permissionsTable } from "./permissionsSchema.ts";

export const rolesTable = pgTable("roles", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull().unique(),
    description: text().notNull(),
    is_system_role: boolean().notNull().default(false),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Role = typeof rolesTable.$inferInsert;

export const rolesRelations = relations(rolesTable, ({ many }) => ({
    permissions: many(permissionsTable),
    users: many(usersTable),
}));
