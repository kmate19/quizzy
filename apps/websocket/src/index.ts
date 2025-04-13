import type { ServerWebSocket } from "bun";
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { genLobbyId } from "./utils/generate";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { websocketMessageSchema } from "@/schemas/zodschemas";
import type { WebsocketMessage } from "repo";
import { extractJwtData } from "./utils/check-jwt";
import type { LobbyMap, LobbyUser, QuizzyJWTPAYLOAD } from "./types";
import { handleWsMessage } from "./input/handle-ws-message";
import { closeIfInvalid, closeWithError } from "./output/close";
import { sendSingle } from "./output/send";
import {
    scheduleDisconnect,
    scheduleLobbyDeletion,
} from "./input/handle-disconnect";
import { reconnect } from "./input/handle-reconnect";
import { getReconnetingCount } from "./utils/get-reconnecting";

const { upgradeWebSocket, websocket } =
    createBunWebSocket<ServerWebSocket<LobbyUser>>();

const lobbies: LobbyMap = new Map();

export const hono = new Hono()
    .basePath("/ws")
    .use(logger())
    .use(cors())
    .get(
        "/ws/server/:lobbyid/:hash",
        zValidator(
            "param",
            z.object({ lobbyid: z.string().length(8), hash: z.string() })
        ),
        upgradeWebSocket(async (c) => {
            const { lobbyid, hash } = c.req.param();

            const jwtdata = await extractJwtData(c);

            return {
                onMessage: (event, ws) => {
                    if (!ws.raw) {
                        ws.close();
                        return;
                    }

                    const parsedMsg = JSON.parse(event.data);

                    const maybeClientMessage =
                        websocketMessageSchema.safeParse(parsedMsg);

                    if (maybeClientMessage.error) {
                        closeWithError(
                            ws.raw,
                            "Invalid message type",
                            1007,
                            maybeClientMessage.error
                        );
                        return;
                    }

                    const clientMessage: WebsocketMessage =
                        maybeClientMessage.data;

                    handleWsMessage(ws.raw, clientMessage, lobbyid, lobbies);
                },
                onOpen: (_, ws) => {
                    if (!ws.raw) {
                        ws.close();
                        return;
                    }

                    if (
                        closeIfInvalid(ws.raw, hash, lobbyid, lobbies, jwtdata)
                    ) {
                        return;
                    }

                    const lobby = lobbies.get(lobbyid)!;

                    const jwtdataValid = jwtdata as QuizzyJWTPAYLOAD;

                    const reconnectingUser = lobby.members
                        .values()
                        .find(
                            (u) =>
                                u.data.lobbyUserData.userId ===
                                jwtdataValid.userId
                        );

                    if (reconnectingUser) {
                        console.log("reconnecting user", jwtdataValid.userId);
                        reconnect(reconnectingUser, ws.raw, lobby, lobbyid);
                        return;
                    }

                    ws.raw.data.lobbyUserData = {
                        userId: jwtdataValid.userId,
                        canRecconnect: true,
                        reconnecting: false,
                        stats: {
                            wrongAnswerCount: 0,
                            correctAnswerCount: 0,
                            score: 0,
                        },
                        pongTimeout: setTimeout(() => {
                            closeWithError(ws.raw!, "Pong timeout", 1001);
                        }, 20000),
                    };

                    const interval = setInterval(() => {
                        if (ws.raw?.readyState === 3) {
                            clearInterval(interval);
                        } else {
                            sendSingle(ws.raw!, "ping");
                        }
                    }, 10000);

                    ws.raw.subscribe(lobbyid);
                    lobby.members.add(ws.raw);

                    console.log(
                        `client ${ws.raw.data.lobbyUserData.userId} joined lobby ${lobbyid}`
                    );
                },
                onClose: (_, ws) => {
                    if (!ws.raw) {
                        return;
                    }

                    const lobby = lobbies.get(lobbyid);

                    if (lobby && lobby.members.has(ws.raw)) {
                        const user = lobby.members
                            .values()
                            .find((m) => m === ws.raw);

                        if (!user!.data.lobbyUserData.canRecconnect) {
                            return;
                        }

                        scheduleDisconnect(ws.raw, lobby, lobbyid);

                        if (
                            lobby.members.size - getReconnetingCount(lobby) ===
                            0
                        ) {
                            scheduleLobbyDeletion(lobbies, lobby, lobbyid);
                        }
                    }
                },
            };
        })
    )
    .post(
        "/reserve/session/:code?",
        zValidator("param", z.object({ code: z.string().optional() })),
        zValidator(
            "query",
            z.object({ ts: z.string().regex(/^\d+$/).transform(Number) })
        ),
        async (c) => {
            const timestamp = c.req.valid("query").ts;
            const timediff = Math.abs(Date.now() - timestamp);

            if (timediff > 3500) {
                return c.json({}, 400);
            }

            const code = c.req.valid("param").code;
            if (code) {
                if (lobbies.has(code)) {
                    return c.json({ code }, 200);
                } else {
                    console.log(`lobby ${code} does not exist`);
                    return c.json({}, 400);
                }
            }

            const jwtData = await extractJwtData(c);
            if (jwtData.json) {
                return jwtData as any;
            }

            const jwtDataValid = jwtData as QuizzyJWTPAYLOAD;

            const lobbyid = genLobbyId();

            if (lobbies.has(lobbyid)) {
                console.log(`lobby ${lobbyid} already exists`);
                return c.json({}, 400);
            }

            lobbies.set(lobbyid, {
                members: new Set(),
                gameState: { hostId: jwtDataValid.userId, started: false },
            });

            return c.json({ code: lobbyid }, 200);
        }
    )
    .get("/health", async (c) => {
        return c.json({ status: "ok" }, 200);
    });

export const server = Bun.serve({
    fetch: hono.fetch,
    port: 3001,
    websocket,
});

console.log("Server is running on port 3001");

export type AppType = typeof hono;
