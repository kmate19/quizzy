import { relations, sql } from "drizzle-orm";
import { uniqueIndex, index, pgEnum, pgTable, serial, timestamp, uuid, check } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema";

export const friendshipStatusEnum = pgEnum("friendship_status", ["pending", "accepted", "blocked"]);

export const friendshipsTable = pgTable("friendships", {
    id: serial().primaryKey(),
    user_id: uuid().notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
    friend_id: uuid().notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
    status: friendshipStatusEnum().notNull().default("pending"),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
    return [
        index().on(table.user_id),
        index().on(table.friend_id),
        uniqueIndex().on(table.user_id, table.friend_id),
        check('can_not_friend_self', sql`${table.user_id} <> ${table.friend_id}`),
    ];
});

export type Friendship = typeof friendshipsTable.$inferInsert;

export const friendshipsRelations = relations(friendshipsTable, ({ one }) => ({
    requester: one(usersTable, {
        fields: [friendshipsTable.user_id],
        references: [usersTable.id],
        relationName: "friendship_requester",
    }),
    addressee: one(usersTable, {
        fields: [friendshipsTable.friend_id],
        references: [usersTable.id],
        relationName: "friendship_addressee",
    }),
}));
