import { Lobby, LobbyUser } from "@/types";
import { ServerWebSocket } from "bun";
import { publishWs } from "./send";
import { hostLeave } from "./host-leave";

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
        hostLeave(lobby.gameState, lobby.members);
    }

    if (!ws.data.lobbyUserData.canRecconnect) {
        console.log("client cannot reconnect");
        publishWs(ws, lobbyid, "disconnect", ws.data.lobbyUserData.username);
        ws.unsubscribe(lobbyid);
        clearTimeout(ws.data.lobbyUserData.pongTimeout);
        lobby.members.delete(ws);

        console.log(
            `client ${ws.data.lobbyUserData.userId} deleted from lobby ${lobbyid} members left: ${lobby.members.size}}`
        );
        return;
    }

    ws.data.lobbyUserData.reconnecting = true;

    ws.data.lobbyUserData.deletionTimeout = setTimeout(() => {
        publishWs(ws, lobbyid, "disconnect", ws.data.lobbyUserData.username);
        ws.unsubscribe(lobbyid);
        clearTimeout(ws.data.lobbyUserData.pongTimeout);
        lobby.members.delete(ws);
        console.log(
            `client ${ws.data.lobbyUserData.userId} deleted from lobby ${lobbyid} members left: ${lobby.members.size}}`
        );
    }, 3000);
}
