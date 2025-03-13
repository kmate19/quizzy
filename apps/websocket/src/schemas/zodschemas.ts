import { Equal } from "hono/utils/types";
import type { LobbyUser, WebsocketMessage, WebsocketMessageType } from "repo";
import { z } from "zod";

const wsMessageTypeZEnum = z.enum([
    "message",
    "subscribe",
    "unsubscribe",
    "ping",
    "pong",
    "ack",
    "whoami",
    "connect",
    "disconnect",
    "handshake",
    "error",
]);

// ignore this, just doing typescript magic to check if the types are correct
function assertequal<T extends true>() {}
let _valid1: Equal<z.infer<typeof wsMessageTypeZEnum>, WebsocketMessageType>;
let _valid2: Equal<z.infer<typeof websocketMessageSchema>, WebsocketMessage>;
let _valid3: Equal<z.infer<typeof UserDataSchema>, LobbyUser>;

assertequal<typeof _valid1>();
assertequal<typeof _valid2>();
assertequal<typeof _valid3>();

export const UserDataSchema = z.object({
    username: z.string(),
    pfp: z.string().base64(),
});

export const websocketMessageSchema = z.object({
    type: wsMessageTypeZEnum,
    successful: z.boolean(),
    server: z.boolean(),
    error: z
        .object({
            message: z.string(),
            raw: z
                .custom<
                    Error | string
                >((v) => v instanceof Error || typeof v === "string")
                .optional(),
        })
        .optional(),
    data: z.custom().optional(),
    clientId: z.string().optional(),
    ext: z
        .object({
            ack: z.boolean().optional(),
            timesync: z
                .object({
                    l: z.number(),
                    o: z.number(),
                    tc: z.number().optional(),
                    ts: z.number().optional(),
                    p: z.number().optional(),
                })
                .optional(),
        })
        .optional(),
});
