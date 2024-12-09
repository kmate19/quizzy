import { relations } from "drizzle-orm";
import { pgTable, timestamp, serial, index, } from "drizzle-orm/pg-core";
import { rolesTable } from "./rolesSchema.ts";
import { permissionsTable } from "./permissionsSchema.ts";

export const rolesPermissionsTable = pgTable("roles_permissions", {
    id: serial().primaryKey(),
    role_id: serial().notNull().references(() => rolesTable.id),
    permission_id: serial().notNull().references(() => permissionsTable.id),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        index().on(table.role_id),
        index().on(table.permission_id),
    ];
});

export type RolePermission = typeof rolesPermissionsTable.$inferInsert;

export const rolesPermissionsRelations = relations(rolesPermissionsTable, ({ one }) => ({
    role: one(rolesTable, {
        fields: [rolesPermissionsTable.role_id],
        references: [rolesTable.id],
    }),
    permission: one(permissionsTable, {
        fields: [rolesPermissionsTable.permission_id],
        references: [permissionsTable.id],
    }),
}));
