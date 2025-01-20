import type { ServerWebSocket } from "bun";
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { genLobbyId } from "./utils/utils.ts";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>()

const lobbies: Map<string, Set<ServerWebSocket>> = new Map()

const app = new Hono()
    .use(logger())
    .use(cors())
    .get("/ws/server/:lobbyid/:hash", upgradeWebSocket(async (c) => {
        const lobbyid = c.req.param("lobbyid")
        return {
            onMessage: (event, ws) => {
                console.log(`client sent message ${event.data.toString()} to lobby ${c.req.param("lobbyid")}`)
                lobbies.get(c.req.param("lobbyid"))?.forEach((client) => {
                    console.log("uhh client", client)
                    if (client !== ws.raw) {
                        console.log("not sending to theirselves")
                        client.send(event.data.toString())
                    }
                });
            },
            onOpen: (_, ws) => {
                if (!lobbies.has(lobbyid)) {
                    ws.close(4000, "Lobby does not exist")
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

                const alldata = [...lobbies.get(lobbyid)!].map((ws) => ws.data as any)

                console.log("sending", alldata)

                console.log("sending", JSON.stringify(alldata))

                ws.raw!.subscribe(c.req.param("lobbyid"))
                ws.send(JSON.stringify(alldata))
            },
            onClose: (_, ws) => {
                console.log(`client left lobby ${c.req.param("lobbyid")}`)
                const lobby = lobbies.get(c.req.param("lobbyid"))
                if (lobby) {
                    lobby.delete(ws.raw!)
                    if (lobby.size === 0) {
                        lobbies.delete(c.req.param("lobbyid"))
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

        return c.json({ code: lobbyid })
    })

export const server = Bun.serve({
    fetch: app.fetch,
    port: 3001,
    websocket
})

console.log("Server is running on port 3001")

export type AppType = typeof app
