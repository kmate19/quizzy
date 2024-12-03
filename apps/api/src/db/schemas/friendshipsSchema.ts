import { relations, sql } from "drizzle-orm";
import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema.ts";

export const friendshipStatusEnum = pgEnum("friendship_status", ["pending", "accepted", "blocked"]);

export const friendshipsTable = pgTable("friendships", {
    userId: uuid().notNull().references(() => usersTable.id),
    friendId: uuid().notNull().references(() => usersTable.id),
    status: friendshipStatusEnum().notNull().default("pending"),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export const friendshipsRelations = relations(friendshipsTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [friendshipsTable.userId],
        references: [usersTable.id],
    }),
    friend: one(usersTable, {
        fields: [friendshipsTable.friendId],
        references: [usersTable.id],
    }),
}));
