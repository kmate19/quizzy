import type { ServerWebSocket } from "bun";
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { generateSessionHash, genLobbyId } from "./utils/utils";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { websocketMessageSchema } from "@/schemas/zodschemas";
import type { WebsocketMessage } from "repo";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>()

const lobbies: Map<string, Set<ServerWebSocket>> = new Map()

export const hono = new Hono().basePath("/ws")
    .use(logger())
    .use(cors())
    .get("/ws/server/:lobbyid/:hash", zValidator('param', z.object({ lobbyid: z.string().length(8), hash: z.string() })), upgradeWebSocket(async (c) => {
        const lobbyid = c.req.param("lobbyid")
        const hash = c.req.param("hash")
        return {
            onMessage: (event, ws) => {
                const validType = websocketMessageSchema.safeParse(event.data)
                if (validType.error) {
                    const res = {
                        type: "error",
                        successful: false,
                        server: true,
                        error: {
                            message: "Invalid message type",
                            raw: validType.error
                        }
                    } satisfies WebsocketMessage
                    ws.send(JSON.stringify(res))
                    // need to send res as a regular message, since ws close frames reasons only accept 123 bytes
                    ws.close(1003, "Invalid message type")
                    return
                }
                console.log(`client sent message ${event.data.toString()} to lobby ${lobbyid}`)
                lobbies.get(lobbyid)?.forEach((client) => {
                    if (client !== ws.raw) {
                        client.send(event.data.toString())
                    }
                });
            },
            onOpen: (_, ws) => {
                if (!lobbies.has(lobbyid)) {
                    const res = {
                        type: "error",
                        successful: false,
                        server: true,
                        error: {
                            message: "Lobby does not exist",
                        }
                    } satisfies WebsocketMessage
                    ws.send(JSON.stringify(res))
                    ws.close(1003, "Lobby does not exist")
                    return
                }

                if (hash !== generateSessionHash(lobbyid, Bun.env.HASH_SECRET || "asd")) {
                    const res = {
                        type: "error",
                        successful: false,
                        server: true,
                        error: {
                            message: "Hash mismatch",
                        }
                    } satisfies WebsocketMessage
                    ws.send(JSON.stringify(res))
                    ws.close(1003, "Hash mismatch")
                    return
                }

                lobbies.get(lobbyid)!.add(ws.raw!)
                console.log(`client joined lobby ${lobbyid}`)

                ws.raw?.ping();

                const interval = setInterval(() => {
                    if (ws.raw?.readyState === 3) {
                        clearInterval(interval);
                    } else {
                        ws.raw?.ping();
                    }
                }, 30000);

                ws.raw!.subscribe(lobbyid)
                const res = {
                    type: "connect",
                    successful: true,
                    server: true,
                    data: {
                        message: `welcome to lobby ${lobbyid}`
                    }
                } satisfies WebsocketMessage
                ws.send(JSON.stringify(res))
            },
            onClose: (_, ws) => {
                console.log(`client left lobby ${lobbyid}`)
                const lobby = lobbies.get(lobbyid)
                if (lobby) {
                    lobby.delete(ws.raw!)
                    if (lobby.size === 0) {
                        lobbies.delete(lobbyid)
                    }
                }
            }
        }
    }))
    .post("/reserve/session/:code?",
        zValidator('param', z.object({ code: z.string().optional() })),
        zValidator('query', z.object({ ts: z.string().regex(/^\d+$/).transform(Number) })),
        async (c) => {
            const timestamp = c.req.valid('query').ts
            const timediff = Math.abs(Date.now() - timestamp)
            console.log(`timediff: ${timediff}`)
            if (timediff > 1500) {
                return c.json({}, 400)
            }


            const code = c.req.valid('param').code
            if (code) {
                if (lobbies.has(code)) {
                    return c.json({ code }, 200)
                } else {
                    return c.json({}, 400)
                }
            }

            const lobbyid = genLobbyId();

            if (lobbies.has(lobbyid)) {
                return c.json({}, 400)
            }

            lobbies.set(lobbyid, new Set())

            return c.json({ code: lobbyid }, 200)
        })
    .get("/health", async (c) => {
        return c.json({ status: "ok" }, 200)
    })

export const server = Bun.serve({
    fetch: hono.fetch,
    port: 3001,
    websocket
})

console.log("Server is running on port 3001")

export type AppType = typeof hono
