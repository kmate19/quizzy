import { Lobby } from "@/types";
import { sendLobby } from "./send";
import ENV from "./env";

export function handleGameEnd(lobby: Lobby) {
    Object.keys(lobby.gameState).forEach(
        // @ts-ignore
        (v) => (lobby.gameState[v as keyof typeof lobby.gameState] = undefined)
    );

    lobby.gameState.started = false;

    // calculate placements

    const sorted = lobby.members
        .values()
        .map((u) => u.data.lobbyUserData)
        .toArray()
        .sort((a, b) => b.stats.score - a.stats.score);

    sorted.forEach((u, i) => {
        u.stats.placement = i;
    });

    const strippedMembers = sorted.map((u) => ({
        userId: u.userId,
        stats: u.stats,
    }));

    // send to api for intra service messaging
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

    // TODO: think about how to close the lobby
}
