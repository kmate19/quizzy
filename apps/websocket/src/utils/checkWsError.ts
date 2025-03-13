import { ServerWebSocket } from "bun";
import { WSContext } from "hono/ws";
import type { WebsocketMessage } from "repo";
import { generateSessionHash } from "./utils";
import { LobbyUser } from "@/types";

export function isInvalidConnection(
    ws: WSContext<ServerWebSocket<unknown>>,
    hash: string,
    lobbyid: string,
    lobbies: Map<string, Set<ServerWebSocket<LobbyUser>>>,
    jwtdata: any
): boolean {
    const res = {
        type: "error",
        successful: false,
        server: true,
        error: {
            message: "",
        },
    } satisfies WebsocketMessage;

    if (!lobbies.has(lobbyid)) {
        res.error.message = "Lobby does not exist";
        ws.send(JSON.stringify(res));
        ws.close(1003, "Lobby does not exist");
        return true;
    }

    if ("ok" in jwtdata) {
        res.error.message = "Bad jwt";
        ws.send(JSON.stringify(res));
        ws.close(1003, "Bad jwt");
        return true;
    }

    if (hash !== generateSessionHash(lobbyid, Bun.env.HASH_SECRET || "asd")) {
        res.error.message = "Hash mismatch";
        ws.send(JSON.stringify(res));
        ws.close(1003, "Hash mismatch");
        return true;
    }

    return false;
}
