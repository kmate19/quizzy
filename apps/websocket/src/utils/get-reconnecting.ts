import { Lobby } from "@/types";

export function getReconnetingCount(lobby: Lobby): number {
    return lobby.members
        .values()
        .filter((u) => u.data.lobbyUserData.reconnecting)
        .toArray().length;
}
