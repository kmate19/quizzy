import { relations } from "drizzle-orm";
import { pgTable, timestamp, serial, index, } from "drizzle-orm/pg-core";
import { rolesTable } from "./rolesSchema.ts";
import { resourceAccessControlTable } from "./resourceAccessControlSchema.ts";

export const roleResourcesTable = pgTable("role_resources", {
    id: serial().primaryKey(),
    role_id: serial().notNull().references(() => rolesTable.id),
    resource_access_id: serial().notNull().references(() => resourceAccessControlTable.id),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        index().on(table.role_id),
        index().on(table.resource_access_id),
    ];
});

export type RoleAccess = typeof roleResourcesTable.$inferInsert;

export const roleResourceRelations = relations(roleResourcesTable, ({ one }) => ({
    role: one(rolesTable, {
        fields: [roleResourcesTable.role_id],
        references: [rolesTable.id],
    }),
    resource: one(resourceAccessControlTable, {
        fields: [roleResourcesTable.resource_access_id],
        references: [resourceAccessControlTable.id],
    }),
}));
