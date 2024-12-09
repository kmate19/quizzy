import { relations } from "drizzle-orm";
import { pgTable, timestamp, serial, uuid, index, } from "drizzle-orm/pg-core";
import { resourceAccessControlTable } from "./resourceAccessControlSchema.ts";
import { usersTable } from "./usersSchema.ts";

export const userResourcesTable = pgTable("user_resources", {
    id: serial().primaryKey(),
    user_id: uuid().notNull().references(() => usersTable.id),
    resource_access_id: serial().notNull().references(() => resourceAccessControlTable.id),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        index().on(table.user_id),
        index().on(table.resource_access_id),
    ];
});

export type UserAccess = typeof userResourcesTable.$inferInsert;

export const userResourcesRelations = relations(userResourcesTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [userResourcesTable.user_id],
        references: [usersTable.id],
    }),
    resource: one(resourceAccessControlTable, {
        fields: [userResourcesTable.resource_access_id],
        references: [resourceAccessControlTable.id],
    }),
}));
