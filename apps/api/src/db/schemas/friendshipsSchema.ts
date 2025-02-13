import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable, serial, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema";

export const friendshipStatusEnum = pgEnum("friendship_status", ["pending", "accepted", "blocked"]);

export const friendshipsTable = pgTable("friendships", {
    id: serial().primaryKey(),
    user_id: uuid().notNull().references(() => usersTable.id),
    friend_id: uuid().notNull().references(() => usersTable.id),
    status: friendshipStatusEnum().notNull().default("pending"),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        index().on(table.user_id),
        index().on(table.friend_id),
    ];
});

export type Friendship = typeof friendshipsTable.$inferInsert;

export const friendshipsRelations = relations(friendshipsTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [friendshipsTable.user_id],
        references: [usersTable.id],
        relationName: "user",
    }),
    friend: one(usersTable, {
        fields: [friendshipsTable.friend_id],
        references: [usersTable.id],
        relationName: "friend",
    }),
}));
