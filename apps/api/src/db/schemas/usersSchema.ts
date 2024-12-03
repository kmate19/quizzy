import { relations } from "drizzle-orm";
import { pgEnum, text, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { friendshipsTable } from "./friendshipsSchema.ts";
import { userTokensTable } from "./userTokensSchema.ts";
import { userRolesTable } from "./userRolesSchema.ts";

export const userStatusEnum = pgEnum("user_status", ["active", "inactive", "away"]);
export const authStatusEnum = pgEnum("auth_status", ["pending", "active", "blocked"]);

export const usersTable = pgTable("users", {
    id: uuid().defaultRandom().primaryKey(),
    username: varchar({ length: 16 }).notNull().unique(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: text().notNull(),
    activity_status: userStatusEnum().notNull().default("inactive"),
    auth_status: authStatusEnum().notNull().default("pending"),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
});

export type User = typeof usersTable.$inferInsert;

export const usersRelations = relations(usersTable, ({ many }) => ({
    friendships: many(friendshipsTable),
    tokens: many(userTokensTable),
    roles: many(userRolesTable),
}));
