import { relations, sql } from "drizzle-orm";
import { text, pgTable, timestamp, serial, varchar, boolean } from "drizzle-orm/pg-core";
import { rolesTable } from "./rolesSchema.ts";

export const permissionsTable = pgTable("permissions", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull().unique(),
    description: text().notNull(),
    resource_type: varchar({ length: 255 }).notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Permission = typeof permissionsTable.$inferInsert;

export const permissionsRelations = relations(permissionsTable, ({ many }) => ({
    roles: many(rolesTable),
}));
