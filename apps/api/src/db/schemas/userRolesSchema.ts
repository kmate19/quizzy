import { relations } from "drizzle-orm";
import { pgTable, timestamp, serial } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema.ts";
import { rolesTable } from "./rolesSchema.ts";

export const userRolesTable = pgTable("user_roles", {
    id: serial().primaryKey(),
    user_id: serial().notNull(),
    role_id: serial().notNull(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
});

export type UserRole = typeof userRolesTable.$inferInsert;

export const userRolesRelations = relations(userRolesTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [userRolesTable.user_id],
        references: [usersTable.id],
    }),
    role: one(rolesTable, {
        fields: [userRolesTable.role_id],
        references: [rolesTable.id],
    }),
}));
