import { relations } from "drizzle-orm";
import {
    pgTable,
    timestamp,
    uuid,
    integer,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema";
import { rolesTable } from "./rolesSchema";

export const userRolesTable = pgTable(
    "user_roles",
    {
        id: integer().generatedAlwaysAsIdentity().primaryKey(),
        user_id: uuid()
            .notNull()
            .references(() => usersTable.id, { onDelete: "cascade" }),
        role_id: integer()
            .notNull()
            .references(() => rolesTable.id, { onDelete: "cascade" }),
        created_at: timestamp().notNull().defaultNow(),
        updated_at: timestamp()
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => {
        return [uniqueIndex().on(table.user_id, table.role_id)];
    }
);

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
