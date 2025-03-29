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

    publishWs(ws, lobbyid, "disconnect", ws.data.lobbyUserData.username);

    // ws.unsubscribe(lobbyid);
    // clearTimeout(ws.data.lobbyUserData.pongTimeout);

    if (lobby.gameState.hostId === ws.data.lobbyUserData.userId) {
        hostLeave(lobby.gameState, lobby.members);
    }

    ws.data.lobbyUserData.reconnecting = true;

    ws.data.lobbyUserData.deletionTimeout = setTimeout(() => {
        lobby.members.delete(ws);
        console.log(
            `client ${ws.data.lobbyUserData.userId} deleted from lobby ${lobbyid} members left: ${lobby.members.size}}`
        );
    }, 3000);
}
