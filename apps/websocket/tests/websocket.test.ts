
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import type { AppType } from "@/index.ts";
import { hc } from "hono/client"; // need hc here to start an actual server for websockets, testClient doesnt work here
import type { Server } from "bun";

const client = hc<AppType>('http://localhost:3001')

let server: Server;
beforeAll(async () => {
    const { server: importedServer } = await import("@/index.ts")
    server = importedServer
});

afterAll(() => {
    server.stop()
});

describe("websocket connection", () => {
    test("client good", async () => {
        const ws = await client.health.$get()
        expect(ws.status).toBe(200);
    });
    test("zvalidator only accepts lenght 8 lobby codes", async () => {
        const res = await server.fetch("/ws/server/fod/dsadsads")
        expect(res.status).toBe(400);
    });
    test("websocket closed with code 1003, since bogus lobby doesnt exist", async () => {
        await new Promise<void>((resolve, reject) => {
            const ws = client.ws.server[":lobbyid"][":hash"].$ws({ param: { lobbyid: "fodifodi", hash: "modi" } })

            const timeout = setTimeout(() => {
                reject(new Error("timeout"))
            }, 1000)

            ws.onclose = (e) => {
                clearTimeout(timeout)
                try {
                    expect(e.code).toBe(1003);
                    resolve()
                } catch (e) {
                    reject(e)
                }
            }
        });
    });
    test("create lobby before websocket then websocket opens, and sends message back", async () => {
        const res = await client.reserve.session.$post({ query: { timestamp: Date.now().toString() } })
        expect(res.status).toBe(200);
        const code = (await res.json()).code

        await new Promise<void>((resolve, reject) => {
            const ws = client.ws.server[":lobbyid"][":hash"].$ws({ param: { lobbyid: code, hash: "ihkwdfqhjkfqjkhf3wgkjhq" } })

            const timeout = setTimeout(() => {
                reject(new Error("timeout"))
            }, 1000)

            ws.onmessage = (e) => {
                clearTimeout(timeout)
                try {
                    console.error("ws res: ", e.data)
                    expect(e.data).toBe(`welcome to lobby ${code}`); // change this to a typed websocket response later
                    resolve()
                } catch (e) {
                    reject(e)
                }
            }
        });
    });
});
