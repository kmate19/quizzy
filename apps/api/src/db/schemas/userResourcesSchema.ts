import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, index, integer } from "drizzle-orm/pg-core";
import { resourceAccessControlTable } from "./resourceAccessControlSchema";
import { usersTable } from "./usersSchema";

export const userResourcesTable = pgTable(
    "user_resources",
    {
        id: integer().generatedAlwaysAsIdentity().primaryKey(),
        user_id: uuid()
            .notNull()
            .references(() => usersTable.id),
        resource_access_id: integer()
            .notNull()
            .references(() => resourceAccessControlTable.id),
        created_at: timestamp().notNull().defaultNow(),
        updated_at: timestamp()
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => {
        return [
            index().on(table.user_id),
            index().on(table.resource_access_id),
        ];
    }
);

export type UserAccess = typeof userResourcesTable.$inferInsert;

export const userResourcesRelations = relations(
    userResourcesTable,
    ({ one }) => ({
        user: one(usersTable, {
            fields: [userResourcesTable.user_id],
            references: [usersTable.id],
        }),
        resource: one(resourceAccessControlTable, {
            fields: [userResourcesTable.resource_access_id],
            references: [resourceAccessControlTable.id],
        }),
    })
);
