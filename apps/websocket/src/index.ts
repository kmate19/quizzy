import type { ServerWebSocket } from "bun";
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { genLobbyId } from "./utils/utils";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { websocketMessageSchema } from "@/schemas/zodschemas";
import type { WebsocketMessage } from "repo";
import { extractJwtData } from "./utils/check-jwt";
import type { LobbyMap, LobbyUser, QuizzyJWTPAYLOAD } from "./types";
import { handleWsMessage } from "./utils/handle-ws-message";
import { closeIfInvalid, closeWithError } from "./utils/close";

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

                    const jwtdataValid = jwtdata as QuizzyJWTPAYLOAD;

                    ws.raw.data.lobbyUserData = {
                        userId: jwtdataValid.userId,
                        stats: {
                            wrongAnswerCount: 0,
                            correctAnswerCount: 0,
                            score: 0,
                        },
                        pongTimeout: setTimeout(() => {
                            ws.raw?.close();
                        }, 20000),
                    };

                    lobbies.get(lobbyid)!.members.add(ws.raw);

                    console.log(
                        `client ${ws.raw.data.lobbyUserData.userId} joined lobby ${lobbyid}`
                    );

                    ws.raw.ping();

                    const interval = setInterval(() => {
                        if (ws.raw?.readyState === 3) {
                            clearInterval(interval);
                        } else {
                            ws.raw?.ping();
                        }
                    }, 10000);

                    ws.raw.subscribe(lobbyid);
                },
                onClose: (_, ws) => {
                    if (!ws.raw) {
                        return;
                    }

                    console.log(
                        `client ${ws.raw.data.lobbyUserData} left lobby ${lobbyid}`
                    );

                    ws.raw.unsubscribe(lobbyid);
                    clearTimeout(ws.raw.data.lobbyUserData.pongTimeout);

                    const lobby = lobbies.get(lobbyid);

                    if (lobby) {
                        lobby.members.delete(ws.raw);
                        if (lobby.members.size === 0) {
                            lobbies.delete(lobbyid);
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

            if (timediff > 1500) {
                return c.json({}, 400);
            }

            const code = c.req.valid("param").code;
            if (code) {
                if (lobbies.has(code)) {
                    return c.json({ code }, 200);
                } else {
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
                return c.json({}, 400);
            }

            lobbies.set(lobbyid, {
                members: new Set(),
                gameState: { hostId: jwtDataValid.userId },
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
