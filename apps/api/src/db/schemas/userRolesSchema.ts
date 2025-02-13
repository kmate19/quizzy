import { relations } from "drizzle-orm";
import { pgTable, timestamp, serial, uuid, index, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema";
import { rolesTable } from "./rolesSchema";

export const userRolesTable = pgTable("user_roles", {
    id: serial().primaryKey(),
    user_id: uuid().notNull().references(() => usersTable.id),
    role_id: integer().notNull().references(() => rolesTable.id),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        index().on(table.user_id),
        index().on(table.role_id),
    ];
});

export type UserRole = typeof userRolesTable.$inferInsert;

export const userRolesRelations = relations(userRolesTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [userRolesTable.user_id],
        references: [usersTable.id],
        relationName: "roleUser",
    }),
    role: one(rolesTable, {
        fields: [userRolesTable.role_id],
        references: [rolesTable.id],
    }),
}));
