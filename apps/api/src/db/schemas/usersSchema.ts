import { relations } from "drizzle-orm";
import {
    pgEnum,
    text,
    pgTable,
    timestamp,
    uuid,
    varchar,
    uniqueIndex,
    boolean,
} from "drizzle-orm/pg-core";
import { friendshipsTable } from "./friendshipsSchema";
import { userTokensTable } from "./userTokensSchema";
import { userRolesTable } from "./userRolesSchema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { reviewsTable } from "./reviewsSchema";
import { userApiKeys } from "./userApiKeysSchema";
import { bytea } from "./customTypes";
import { userStatsTable } from "./userStatsSchema";

export const userStatusEnum = pgEnum("user_status", [
    "active",
    "inactive",
    "away",
]);
export const authStatusEnum = pgEnum("auth_status", [
    "pending",
    "active",
    "blocked",
]);

export const usersTable = pgTable(
    "users",
    {
        id: uuid().defaultRandom().primaryKey(),
        username: varchar({ length: 16 }).notNull().unique(),
        email: varchar({ length: 255 }).notNull().unique(),
        password: text().notNull(),
        activity_status: userStatusEnum().notNull().default("inactive"),
        profile_picture: bytea(),
        auth_status: authStatusEnum().notNull().default("pending"),
        firstTimeLogin: boolean().default(true),
        created_at: timestamp().notNull().defaultNow(),
        updated_at: timestamp()
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => {
        return [
            uniqueIndex().on(table.username),
            uniqueIndex().on(table.email),
            uniqueIndex().on(table.username, table.email),
        ];
    }
);

export type User = typeof usersTable.$inferSelect;
export const UserInferSelectRaw = usersTable.$inferSelect;

export const SelectUserSchemaRaw = createSelectSchema(usersTable);
export const RegisterUserSchema = createInsertSchema(usersTable)
    .pick({ email: true, password: true, username: true })
    .extend({ email: z.string().email() });
export const LoginUserSchema = createSelectSchema(usersTable)
    .pick({ password: true })
    .extend({ username_or_email: z.string() });

export const usersRelations = relations(usersTable, ({ one, many }) => ({
    sentFriendships: many(friendshipsTable, {
        relationName: "friendship_requester",
    }),
    recievedFriendships: many(friendshipsTable, {
        relationName: "friendship_addressee",
    }),
    tokens: many(userTokensTable),
    roles: many(userRolesTable),
    reviews: many(reviewsTable),
    api_keys: many(userApiKeys),
    stats: one(userStatsTable, {
        fields: [usersTable.id],
        references: [userStatsTable.user_id],
    }),
}));
