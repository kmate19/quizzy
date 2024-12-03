import { relations, sql } from "drizzle-orm";
import { pgEnum, text, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { friendshipsTable } from "./friendshipsSchema.ts";
import { userTokensTable } from "./userTokensSchema.ts";

export const userStatusEnum = pgEnum("user_status", ["active", "inactive", "away"]);
export const authStatusEnum = pgEnum("auth_status", ["pending", "active", "blocked"]);

export const usersTable = pgTable("users", {
    id: uuid().defaultRandom().primaryKey(),
    username: varchar({ length: 16 }).notNull().unique(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: text().notNull(),
    status: userStatusEnum().notNull().default("inactive"),
    authStatus: authStatusEnum().notNull().default("pending"),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
});

export type User = typeof usersTable.$inferInsert;

export const usersRelations = relations(usersTable, ({ many }) => ({
    friendships: many(friendshipsTable),
    tokens: many(userTokensTable),
}));
