import { relations, sql } from "drizzle-orm";
import { text, pgTable, timestamp, serial, varchar, boolean } from "drizzle-orm/pg-core";
import { rolesTable } from "./rolesSchema.ts";
import { permissionsTable } from "./permissionsSchema.ts";

export const rolesPermissionsTable = pgTable("roles_permissions", {
    id: serial().primaryKey(),
    role_id: serial().notNull(),
    permission_id: serial().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
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
