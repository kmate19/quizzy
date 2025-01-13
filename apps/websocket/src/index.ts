import type { ServerWebSocket } from "bun";
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { genLobbyId } from "./utils/utils.ts";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>()

const lobbies: Map<string, Set<ServerWebSocket>> = new Map()

const app = new Hono().basePath("/ws")
    .use(logger())
    .use(cors())
    .get("/server/:lobbyid", upgradeWebSocket(async (c) => {
        return {
            onMessage: (event, ws) => {
                console.log(`client sent message ${event.data.toString()} to lobby ${c.req.param("lobbyid")}`)
                lobbies.get(c.req.param("lobbyid"))?.forEach((client) => {
                    console.log(`uhh client ${client}`)
                    if (client !== ws.raw) {
                        console.log(`uhh client NOT EQUAL ${client}`)
                        client.send(event.data.toString())
                    }
                });
            },
            onOpen: (_, ws) => {
                if (!lobbies.has(c.req.param("lobbyid"))) {
                    lobbies.set(c.req.param("lobbyid"), new Set())
                    console.log(`client created lobby ${c.req.param("lobbyid")}`)
                } else {
                    lobbies.get(c.req.param("lobbyid"))?.add(ws.raw!)
                    console.log(`client joined lobby ${c.req.param("lobbyid")}`)
                }

                ws.raw?.ping(); // Send periodic pings to ensure connection health

                const interval = setInterval(() => {
                    if (ws.raw?.readyState === 3) {
                        clearInterval(interval);
                    } else {
                        ws.raw?.ping();
                    }
                }, 30000);

                ws.raw!.subscribe(c.req.param("lobbyid"))
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
    .get("/broadcast", async (c) => {
        return c.text("")
    })
//// move to api
//.get("lobby/getcode", async (c) => {
//    const lobbyid = genLobbyId();
//
//    return c.json({ code: lobbyid })
//})

export const server = Bun.serve({
    fetch: app.fetch,
    port: 3001,
    websocket
})

console.log("Server is running on port 3001")

export type AppType = typeof app
