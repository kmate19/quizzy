import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, index, integer } from "drizzle-orm/pg-core";
import { rolesTable } from "./rolesSchema";
import { resourceTypeEnum } from "./permissionsSchema";
import { usersTable } from "./usersSchema";
import { userApiKeys } from "./userApiKeysSchema";

// TODO:

export const permBitMapping = {
    read: 1,
    create: 2,
    update: 4,
    delete: 8,
} as const;

export const resourceAccessControlTable = pgTable(
    "resource_access_control",
    {
        id: integer().generatedAlwaysAsIdentity().primaryKey(),
        role_id: integer().references(() => rolesTable.id),
        user_id: uuid().references(() => usersTable.id),
        resource_type: resourceTypeEnum().notNull(),
        // this is going to be a bitmask of permissions
        // can_read = 1 bin 0001
        // can_create = 2 bin 0010
        // can_update = 4 bin 0100
        // can_delete = 8 bin 1000
        // read and delete for example is 9 bin 1001
        permissons: integer().notNull().default(0),
        //can_read: boolean().notNull().default(false),
        //can_create: boolean().notNull().default(false),
        //can_update: boolean().notNull().default(false),
        //can_delete: boolean().notNull().default(false),
        created_at: timestamp().notNull().defaultNow(),
        updated_at: timestamp()
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => {
        return [
            index().on(table.user_id),
            index().on(table.role_id),
            index().on(table.permissons),
        ];
    }
);

export type ResourceAccessControl =
    typeof resourceAccessControlTable.$inferInsert;

export const resourceAccessControlRelations = relations(
    resourceAccessControlTable,
    ({ many }) => ({
        role: many(rolesTable),
        user: many(usersTable),
        api_keys: many(userApiKeys),
    })
);
