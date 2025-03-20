import { Lobby } from "@/types";
import { sendLobby } from "./send";
import ENV from "./env";

export function handleGameEnd(lobby: Lobby) {
    Object.keys(lobby.gameState).forEach(
        (v) => (lobby.gameState[v as keyof typeof lobby.gameState] = undefined)
    );

    lobby.gameState.started = false;

    // calculate placements

    const sorted = lobby.members
        .values()
        .map((u) => u.data.lobbyUserData)
        .toArray()
        .sort((a, b) => a.stats.score - b.stats.score);

    sorted.forEach((u, i) => {
        u.stats.placement = i;
    });

    const strippedMembers = sorted.map((u) => ({
        userId: u.userId,
        stats: u.stats,
    }));

    fetch("http://localhost:3000/api/v1/events/quiz-finished", {
        headers: {
            Authorization: `Bearer ${ENV.WS_SECRET()}`,
        },
        body: JSON.stringify({
            members: strippedMembers,
            quizId: lobby.quizData!.quiz.id,
            type: "multi",
        }),
    });

    sendLobby(lobby.members, "gamended", sorted);
}
