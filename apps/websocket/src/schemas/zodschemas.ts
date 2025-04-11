import {
    numericStringSchema,
    publishQuizSchema,
} from "@repo/api/public-schemas";
import { Equal } from "hono/utils/types";
import type { LobbyUser, WebsocketMessage, WebsocketMessageType } from "repo";
import { z } from "zod";

// TODO: filter out system messages that can only be sent by the server
const wsMessageTypeZEnum = z.enum([
    "gamestate",
    "sendchatmessage",
    "recvchatmessage",
    "hostchange",
    "kick",
    "answered",
    "roundstarted",
    "roundended",
    "gamended",
    "gamestarted",
    "startgame",
    "quizmeta",
    "quizdata",
    "members",
    "ping",
    "pong",
    "whoami",
    "connect",
    "disconnect",
    "error",
]);
export const publishQuizSchemaWID = publishQuizSchema.extend({
    quiz: publishQuizSchema.shape.quiz.extend({
        id: z.string().uuid(),
    }),
});

// ignore this, just doing typescript magic to check if the types are correct
function assertequal<T extends true>() {}
let _valid1: Equal<z.infer<typeof wsMessageTypeZEnum>, WebsocketMessageType>;
let _valid2: Equal<z.infer<typeof websocketMessageSchema>, WebsocketMessage>;
let _valid3: Equal<z.infer<typeof UserDataSchema>, LobbyUser>;

assertequal<typeof _valid1>();
assertequal<typeof _valid2>();
assertequal<typeof _valid3>();

export const quizAnswerSchema = z.object({
    answerTime: numericStringSchema,
    answerIndex: numericStringSchema,
});

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
