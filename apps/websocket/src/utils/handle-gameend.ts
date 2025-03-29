import { Lobby } from "@/types";
import { sendLobby } from "./send";
import ENV from "./env";
import { abortLobby } from "./close";

export function handleGameEnd(lobby: Lobby) {
    if (!lobby.gameState.started) {
        abortLobby(
            lobby,
            "Game state invariant violated while running game loop: game is not started"
        );
        return;
    }

    // reset game state
    lobby.gameState = {
        hostId: lobby.gameState.hostId,
        started: false,
    };

    // calculate placements
    const sorted = lobby.members
        .values()
        .map((u) => u.data.lobbyUserData)
        .toArray()
        .sort((a, b) => b.stats.score - a.stats.score);

    sorted.forEach((u, i) => {
        u.stats.placement = i + 1;
    });

    const strippedMembers = sorted.map((u) => ({
        userId: u.userId,
        stats: u.stats,
    }));

    if (strippedMembers.length > 1) {
        // send to api for intra service messaging
        fetch("http://localhost:3000/api/v1/events/quiz-finished", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${ENV.WS_SECRET()}`,
            },
            body: JSON.stringify({
                members: strippedMembers,
                quizId: lobby.quizData!.quiz.id,
                type: "multi",
            }),
        });
    }

    sendLobby(lobby.members, "gamended", sorted);
}
