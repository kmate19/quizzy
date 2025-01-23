import { relations } from "drizzle-orm";
import { pgTable, timestamp, serial, index, integer, } from "drizzle-orm/pg-core";
import { resourceAccessControlTable } from "./resourceAccessControlSchema";
import { userApiKeys } from "./userApiKeysSchema";

export const userApiKeyResources = pgTable("api_key_resources", {
    id: serial().primaryKey(),
    api_key_id: integer().notNull().references(() => userApiKeys.id),
    resource_access_id: integer().notNull().references(() => resourceAccessControlTable.id),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        index().on(table.api_key_id),
        index().on(table.resource_access_id),
    ];
});

export type ApiKeyAccess = typeof userApiKeyResources.$inferInsert;

export const apiKeyRelations = relations(userApiKeyResources, ({ one }) => ({
    api_key: one(userApiKeys, {
        fields: [userApiKeyResources.api_key_id],
        references: [userApiKeys.id],
    }),
    resource: one(resourceAccessControlTable, {
        fields: [userApiKeyResources.resource_access_id],
        references: [resourceAccessControlTable.id],
    }),
}));
