import { GameState, Lobby, LobbyUser } from "@/types";
import { ServerWebSocket } from "bun";
import { publishWs, sendLobby } from "@/output/send";

export function scheduleDisconnect(
    ws: ServerWebSocket<LobbyUser>,
    lobby: Lobby,
    lobbyid: string
) {
    console.log(
        `client ${ws.data.lobbyUserData.userId} left lobby ${lobbyid} scheduling for deletion, members left: ${lobby.members.size}}`
    );

    if (lobby.gameState.hostId === ws.data.lobbyUserData.userId) {
        console.log("host left");
        scheduleHostChange(lobby.gameState, lobby.members);
    }

    if (!ws.data.lobbyUserData.canRecconnect) {
        console.log("client cannot reconnect");
        disconnect(ws, lobby, lobbyid);
        return;
    }

    ws.data.lobbyUserData.reconnecting = true;

    ws.data.lobbyUserData.deletionTimeout = setTimeout(() => {
        disconnect(ws, lobby, lobbyid);
    }, 3000);
}

function disconnect(
    ws: ServerWebSocket<LobbyUser>,
    lobby: Lobby,
    lobbyid: string
) {
    publishWs(ws, lobbyid, "disconnect", ws.data.lobbyUserData.username);
    ws.unsubscribe(lobbyid);
    clearTimeout(ws.data.lobbyUserData.pongTimeout);
    lobby.members.delete(ws);

    console.log(
        `client ${ws.data.lobbyUserData.userId} deleted from lobby ${lobbyid} members left: ${lobby.members.size}}`
    );
}

function scheduleHostChange(
    gameState: GameState,
    members: Set<ServerWebSocket<LobbyUser>>
) {
    setTimeout(() => {
        if (
            !members
                .values()
                .some((m) => m.data.lobbyUserData.userId === gameState.hostId)
        ) {
            // if host leaves, currently we just make another random member the host if there are any
            const nextHost = members.values().next().value;

            if (!nextHost) {
                return;
            }

            console.log("changing host");
            gameState.hostId = nextHost.data.lobbyUserData.userId;

            // send message to all members that the host has changed
            sendLobby(members, "hostchange", { userId: gameState.hostId });
        }
    }, 3500);
}
