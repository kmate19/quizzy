import { GameState, LobbyUser } from "@/types";
import { ServerWebSocket } from "bun";
import { sendLobby } from "./send";

export function hostLeave(
    gameState: GameState,
    members: Set<ServerWebSocket<LobbyUser>>
) {
    // if host leaves, currently we just make another random member the host if there are any
    const nextHost = members.values().next().value;

    if (!nextHost) {
        return;
    }

    setTimeout(() => {
        gameState.hostId = nextHost.data.lobbyUserData.userId;

        // send message to all members that the host has changed
        sendLobby(members, "hostchange", { userId: gameState.hostId });
    }, 3000);
}
