import type { ServerWebSocket } from "bun";
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { genLobbyId } from "./utils/utils";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>()

const lobbies: Map<string, Set<ServerWebSocket>> = new Map()

export const app = new Hono()
    .use(logger())
    .use(cors())
    .get("/ws/server/:lobbyid/:hash", zValidator('param', z.object({ lobbyid: z.string().length(8), hash: z.string() })), upgradeWebSocket(async (c) => {
        const lobbyid = c.req.param("lobbyid")
        return {
            onMessage: (event, ws) => {
                console.log(`client sent message ${event.data.toString()} to lobby ${lobbyid}`)
                lobbies.get(lobbyid)?.forEach((client) => {
                    if (client !== ws.raw) {
                        client.send(event.data.toString())
                    }
                });
            },
            onOpen: (_, ws) => {
                if (!lobbies.has(lobbyid)) {
                    ws.close(1003, "Lobby does not exist")
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
                ws.send(`welcome to lobby ${lobbyid}`)
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
    .post("/reserve/session", zValidator('query', z.object({ timestamp: z.string().regex(/^\d+$/).transform(Number) })), async (c) => {
        const timestamp = c.req.valid('query').timestamp
        const timediff = Date.now() - timestamp
        console.log(`timediff: ${timediff}`)
        if (timediff > 1500) {
            return c.json({}, 400)
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
    fetch: app.fetch,
    port: 3001,
    websocket
})

console.log("Server is running on port 3001")

export type AppType = typeof app
