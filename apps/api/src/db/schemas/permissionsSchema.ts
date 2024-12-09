import { relations } from "drizzle-orm";
import { text, pgTable, timestamp, serial, varchar, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { rolesTable } from "./rolesSchema.ts";

export const resourceTypeEnum = pgEnum("resource_type", ["quiz", "comment", "message", "auth_status"]);

export const permissionsTable = pgTable("permissions", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull().unique(),
    description: text().notNull(),
    resource_type: resourceTypeEnum().notNull(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        uniqueIndex().on(table.name),
    ];
});

export type Permission = typeof permissionsTable.$inferInsert;

export const permissionsRelations = relations(permissionsTable, ({ many }) => ({
    roles: many(rolesTable),
}));
