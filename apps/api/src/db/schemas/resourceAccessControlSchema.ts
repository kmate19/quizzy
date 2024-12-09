import { relations } from "drizzle-orm";
import { pgTable, timestamp, serial, uuid, boolean, index, } from "drizzle-orm/pg-core";
import { rolesTable } from "./rolesSchema.ts";
import { resourceTypeEnum } from "./permissionsSchema.ts";
import { usersTable } from "./usersSchema.ts";
import { userApiKeys } from "./userApiKeysSchema.ts";

export const resourceAccessControlTable = pgTable("resource_access_control", {
    id: serial().primaryKey(),
    role_id: serial().references(() => rolesTable.id),
    user_id: uuid().references(() => usersTable.id),
    resource_type: resourceTypeEnum().notNull(),
    can_read: boolean().notNull().default(false),
    can_create: boolean().notNull().default(false),
    can_update: boolean().notNull().default(false),
    can_delete: boolean().notNull().default(false),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        index().on(table.user_id),
        index().on(table.role_id),
    ];
});

export type ResourceAccessControl = typeof resourceAccessControlTable.$inferInsert;

export const resourceAccessControlRelations = relations(resourceAccessControlTable, ({ many }) => ({
    role: many(rolesTable),
    user: many(usersTable),
    api_keys: many(userApiKeys),
}));
