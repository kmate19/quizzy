import { relations } from "drizzle-orm";
import {
    text,
    pgTable,
    timestamp,
    varchar,
    boolean,
    uniqueIndex,
    integer,
} from "drizzle-orm/pg-core";
import { permissionsTable } from "./permissionsSchema";
import { userRolesTable } from "./userRolesSchema";

export const rolesTable = pgTable(
    "roles",
    {
        id: integer().generatedAlwaysAsIdentity().primaryKey(),
        name: varchar({ length: 255 }).notNull().unique(),
        description: text().notNull(),
        is_system_role: boolean().notNull().default(false),
        created_at: timestamp().notNull().defaultNow(),
        updated_at: timestamp()
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => {
        return [uniqueIndex().on(table.name)];
    }
);

export const RolesInferSelectRaw = rolesTable.$inferSelect;
export type Role = typeof rolesTable.$inferSelect;
export type RoleInsert = typeof rolesTable.$inferInsert;

export const rolesRelations = relations(rolesTable, ({ many }) => ({
    permissions: many(permissionsTable),
    users: many(userRolesTable),
}));
