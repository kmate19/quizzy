
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import type { AppType } from "@/index";
import { hc } from "hono/client"; // need hc here to start an actual server for websockets, testClient doesnt work here
import type { Server } from "bun";
import { generateSessionHash } from "@/utils/utils";
import { WebsocketMessage } from "repo";

// TODO: abstract

const client = hc<AppType>('http://localhost:3001')

let server: Server;
beforeAll(async () => {
    const { server: importedServer } = await import("@/index")
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

            ws.onmessage = (e) => {
                clearTimeout(timeout)
                try {
                    console.error("ws res: ", e.data)
                    const response = JSON.parse(e.data) as WebsocketMessage
                    expect(response.type).toBe("error");
                    expect(response.error?.message).toBe("Lobby does not exist");
                } catch (e) {
                    reject(e)
                }
            }

            ws.onclose = (e) => {
                clearTimeout(timeout)
                try {
                    expect(e.code).toBe(1003);
                    expect(e.reason).toBe("Lobby does not exist");
                    resolve()
                } catch (e) {
                    reject(e)
                }
            }
        });
    });
    test("websocket closed with code 1003, since gets invalid message", async () => {
        const res = await client.reserve.session[":code?"].$post({ param: { code: "" }, query: { ts: Date.now().toString() } })
        expect(res.status).toBe(200);
        const code = (await res.json()).code

        const hash = generateSessionHash(code, Bun.env.HASH_SECRET || "asd")
        await new Promise<void>((resolve, reject) => {
            const ws = client.ws.server[":lobbyid"][":hash"].$ws({ param: { lobbyid: code, hash } })

            ws.onopen = () => {
                ws.send(JSON.stringify({ randomkey: "randomvalue", randomkey2: { haha: 123 } }))
            }

            const timeout = setTimeout(() => {
                reject(new Error("timeout"))
            }, 1000)

            ws.onmessage = (e) => {
                const response = JSON.parse(e.data) as WebsocketMessage
                if (response.type === "connect") {
                    // ignore connection welcome message for this test to be able to test invalid message sending
                    return
                }
                clearTimeout(timeout)
                try {
                    console.error("ws res: ", e.data)
                    expect(response.type).toBe("error");
                    expect(response.error?.message).toBe("Invalid message type");
                } catch (e) {
                    reject(e)
                }
            }

            ws.onclose = (e) => {
                clearTimeout(timeout)
                try {
                    expect(e.code).toBe(1003);
                    console.log(e.reason)
                    expect(e.reason).toBe("Invalid message type");
                    resolve()
                } catch (e) {
                    reject(e)
                }
            }
        });
    });
    test("websocket closes with 1003, cause gets invalid hash", async () => {
        const res = await client.reserve.session[":code?"].$post({ param: { code: "" }, query: { ts: Date.now().toString() } })
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
                    const response = JSON.parse(e.data) as WebsocketMessage
                    expect(response.type).toBe("error");
                    expect(response.error?.message).toBe("Hash mismatch");
                } catch (e) {
                    reject(e)
                }
            }

            ws.onclose = (e) => {
                clearTimeout(timeout)
                try {
                    expect(e.code).toBe(1003);
                    expect(e.reason).toBe("Hash mismatch");
                    resolve()
                } catch (e) {
                    reject(e)
                }
            }
        });
    });
    test("create lobby before websocket then websocket opens, and sends message back", async () => {
        const res = await client.reserve.session[":code?"].$post({ param: { code: "" }, query: { ts: Date.now().toString() } })
        expect(res.status).toBe(200);
        const code = (await res.json()).code

        const hash = generateSessionHash(code, Bun.env.HASH_SECRET || "asd")
        await new Promise<void>((resolve, reject) => {
            const ws = client.ws.server[":lobbyid"][":hash"].$ws({ param: { lobbyid: code, hash } })

            const timeout = setTimeout(() => {
                reject(new Error("timeout"))
            }, 1000)

            ws.onmessage = (e) => {
                clearTimeout(timeout)
                try {
                    console.error("ws res: ", e.data)
                    const response = JSON.parse(e.data) as WebsocketMessage<{ message: string }>
                    expect(response.data?.message).toBe(`welcome to lobby ${code}`); // change this to a typed websocket response later
                    resolve()
                } catch (e) {
                    reject(e)
                }
            }
        });
    });
});
