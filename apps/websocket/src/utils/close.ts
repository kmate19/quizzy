import { Lobby, LobbyMap } from "@/types";
import { ServerWebSocket } from "bun";
import { WebsocketMessage } from "repo";
import { generateSessionHash } from "./utils";

export function closeWithError<E extends Error>(
    ws: ServerWebSocket<unknown>,
    message: string,
    code: number = 1008,
    error?: E
) {
    console.error(error);

    const res = {
        type: "error",
        successful: false,
        server: true,
        error: {
            message,
        },
    } satisfies WebsocketMessage;

    ws.send(JSON.stringify(res));
    ws.close(code, message);
}

export function abortLobby(lobby: Lobby, errMessage: string) {
    console.error(`!!ABORTING LOBBY!!: ${errMessage}`);

    lobby.members.values().forEach((m) => {
        closeWithError(m, "Server error");
    });
}

export function closeIfInvalid(
    ws: ServerWebSocket<unknown>,
    hash: string,
    lobbyid: string,
    lobbies: LobbyMap,
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
        ws.close(1008, "Lobby does not exist");
        return true;
    }

    if ("ok" in jwtdata) {
        res.error.message = "Bad jwt";
        ws.send(JSON.stringify(res));
        ws.close(1008, "Bad jwt");
        return true;
    }

    if (hash !== generateSessionHash(lobbyid, Bun.env.HASH_SECRET || "asd")) {
        res.error.message = "Hash mismatch";
        ws.send(JSON.stringify(res));
        ws.close(1008, "Hash mismatch");
        return true;
    }

    return false;
}
