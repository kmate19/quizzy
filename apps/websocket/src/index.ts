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
import { extractJwtData } from "./utils/checkjwt";
import { isInvalidConnection } from "./utils/checkWsError";
import { LobbyUser, QuizzyJWTPAYLOAD } from "./types";
import { handleWsMessage } from "./utils/handleWsMessage";

const { upgradeWebSocket, websocket } =
    createBunWebSocket<ServerWebSocket<LobbyUser>>();

const lobbies: Map<string, Set<ServerWebSocket<LobbyUser>>> = new Map();

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

                    const maybeClientMessage = websocketMessageSchema.safeParse(
                        event.data
                    );

                    if (maybeClientMessage.error) {
                        const res = {
                            type: "error",
                            successful: false,
                            server: true,
                            error: {
                                message: "Invalid message type",
                                raw: maybeClientMessage.error,
                            },
                        } satisfies WebsocketMessage;
                        ws.send(JSON.stringify(res));
                        // need to send res as a regular message, since ws close frames reasons only accept 123 bytes
                        ws.close(1003, "Invalid message type");
                        return;
                    }

                    const clientMessage: WebsocketMessage =
                        maybeClientMessage.data;

                    handleWsMessage(ws.raw, clientMessage, lobbyid);

                    lobbies.get(lobbyid)?.forEach((client) => {
                        if (client !== ws.raw) {
                            client.send(JSON.stringify(clientMessage));
                        }
                    });
                },
                onOpen: (_, ws) => {
                    if (!ws.raw) {
                        ws.close();
                        return;
                    }

                    if (
                        isInvalidConnection(ws, hash, lobbyid, lobbies, jwtdata)
                    ) {
                        return;
                    }

                    const jwtdataValid = jwtdata as QuizzyJWTPAYLOAD;

                    ws.raw.data.userId = jwtdataValid.userId;
                    ws.raw.data.stats.wrongAnswerCount = 0;
                    ws.raw.data.stats.correctAnswerCount = 0;

                    lobbies.get(lobbyid)?.add(ws.raw);

                    console.log(
                        `client ${ws.raw.data.userId} joined lobby ${lobbyid}`
                    );

                    const interval = setInterval(() => {
                        if (ws.raw?.readyState === 3) {
                            clearInterval(interval);
                        } else {
                            ws.raw?.ping();
                        }
                    }, 24000);

                    ws.raw.subscribe(lobbyid);

                    const res = {
                        type: "connect",
                        successful: true,
                        server: true,
                        data: {
                            message: `welcome to lobby ${lobbyid}`,
                        },
                    } satisfies WebsocketMessage;
                    ws.send(JSON.stringify(res));
                },
                onClose: (_, ws) => {
                    if (!ws.raw) {
                        return;
                    }

                    console.log(
                        `client ${ws.raw.data.userId} left lobby ${lobbyid}`
                    );

                    const lobby = lobbies.get(lobbyid);

                    if (lobby) {
                        lobby.delete(ws.raw);
                        if (lobby.size === 0) {
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
            console.log(`timediff: ${timediff}`);
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

            const lobbyid = genLobbyId();

            if (lobbies.has(lobbyid)) {
                return c.json({}, 400);
            }

            lobbies.set(lobbyid, new Set());

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
