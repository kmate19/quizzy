import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import type { AppType } from "@/index";
import { hc } from "hono/client"; // need hc here to start an actual server for websockets, testClient doesnt work here
import type { Server } from "bun";
import { generateSessionHash } from "@/utils/utils";
import { WebsocketMessage } from "repo";
import { createWebsocketEnv } from "./testUtils/helpers";
import { LobbyUser } from "@/types";

const client = hc<AppType>("http://localhost:3001").ws;

let server: Server;
beforeAll(async () => {
    const { server: importedServer } = await import("@/index");
    server = importedServer;
});

afterAll(() => {
    server.stop();
});

describe("websocket connection", () => {
    test("client good", async () => {
        const ws = await client.health.$get();
        expect(ws.status).toBe(200);
    });
    test("zvalidator only accepts lenght 8 lobby codes", async () => {
        const res = await server.fetch("/ws/server/fod/dsadsads");
        expect(res.status).toBe(400);
    });
    test("websocket closed with code 1003, since bogus lobby doesnt exist", async () => {
        const ws = client.ws.server[":lobbyid"][":hash"].$ws({
            param: { lobbyid: "fodifodi", hash: "modi" },
        });
        await createWebsocketEnv(ws, {
            onmessage: (_, response: WebsocketMessage) => {
                expect(response.type).toBe("error");
                expect(response.error?.message).toBe("Lobby does not exist");
                return undefined;
            },
            onclose: (e) => {
                expect(e.code).toBe(1003);
                expect(e.reason).toBe("Lobby does not exist");
                return { success: true, canResolve: true };
            },
        });
    });
    test("websocket closed with code 1003, since gets invalid message", async () => {
        const res = await client.reserve.session[":code?"].$post({
            param: { code: "" },
            query: { ts: Date.now().toString() },
        });
        expect(res.status).toBe(200);
        const code = (await res.json()).code;

        const hash = generateSessionHash(code, Bun.env.HASH_SECRET || "asd");
        const ws = client.ws.server[":lobbyid"][":hash"].$ws({
            param: { lobbyid: code, hash },
        });
        await createWebsocketEnv(
            ws,
            {
                onmessage: (_, response: WebsocketMessage) => {
                    expect(response.type).toBe("error");
                    expect(response.error?.message).toBe(
                        "Invalid message type"
                    );
                    return undefined;
                },
                onopen: (_) => {
                    ws.send(
                        JSON.stringify({
                            randomkey: "randomvalue",
                            randomkey2: { haha: 123 },
                        })
                    );
                    return undefined;
                },
                onclose: (e) => {
                    expect(e.code).toBe(1003);
                    expect(e.reason).toBe("Invalid message type");
                    return { success: true, canResolve: true };
                },
            },
            ["connect"]
        );
    });
    test("websocket closes with 1003, cause gets invalid hash", async () => {
        const res = await client.reserve.session[":code?"].$post({
            param: { code: "" },
            query: { ts: Date.now().toString() },
        });
        expect(res.status).toBe(200);
        const code = (await res.json()).code;

        const ws = client.ws.server[":lobbyid"][":hash"].$ws({
            param: { lobbyid: code, hash: "ihkwdfqhjkfqjkhf3wgkjhq" },
        });
        await createWebsocketEnv(ws, {
            onmessage: (_, response: WebsocketMessage) => {
                expect(response.type).toBe("error");
                expect(response.error?.message).toBe("Hash mismatch");
                return undefined;
            },
            onclose: (e) => {
                expect(e.code).toBe(1003);
                expect(e.reason).toBe("Hash mismatch");
                return { success: true, canResolve: true };
            },
        });
    });
    test("create lobby before websocket then websocket opens, and sends message back", async () => {
        const res = await client.reserve.session[":code?"].$post({
            param: { code: "" },
            query: { ts: Date.now().toString() },
        });
        expect(res.status).toBe(200);
        const code = (await res.json()).code;

        const hash = generateSessionHash(code, Bun.env.HASH_SECRET || "asd");
        const ws = client.ws.server[":lobbyid"][":hash"].$ws({
            param: { lobbyid: code, hash },
        });

        await createWebsocketEnv(ws, {
            onmessage: (_, response: WebsocketMessage) => {
                // not pretty but typescript moment
                console.log(response);
                expect(
                    (response as WebsocketMessage<LobbyUser>).data?.userId
                ).toBe(`welcome to lobby ${code}`); // change this to a typed websocket response later
                return { success: true, canResolve: true };
            },
        });
    });
});
