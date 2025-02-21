import { relations } from "drizzle-orm";
import { pgTable, timestamp, index, integer } from "drizzle-orm/pg-core";
import { rolesTable } from "./rolesSchema";
import { permissionsTable } from "./permissionsSchema";

export const rolesPermissionsTable = pgTable(
    "roles_permissions",
    {
        id: integer().generatedAlwaysAsIdentity().primaryKey(),
        role_id: integer()
            .notNull()
            .references(() => rolesTable.id),
        permission_id: integer()
            .notNull()
            .references(() => permissionsTable.id),
        created_at: timestamp().notNull().defaultNow(),
        updated_at: timestamp()
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => {
        return [index().on(table.role_id), index().on(table.permission_id)];
    }
);

export type RolePermission = typeof rolesPermissionsTable.$inferInsert;

export const rolesPermissionsRelations = relations(
    rolesPermissionsTable,
    ({ one }) => ({
        role: one(rolesTable, {
            fields: [rolesPermissionsTable.role_id],
            references: [rolesTable.id],
        }),
        permission: one(permissionsTable, {
            fields: [rolesPermissionsTable.permission_id],
            references: [permissionsTable.id],
        }),
    })
);
