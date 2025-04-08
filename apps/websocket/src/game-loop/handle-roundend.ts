import { Lobby } from "@/types";
import { abortLobby } from "@/output/close";
import { sendLobby } from "@/output/send";

export function handleRoundEnd(lobby: Lobby, correct_answer_index: number) {
    if (!lobby.gameState.started) {
        abortLobby(
            lobby,
            "Game state invariant violated while running game loop: game is not started"
        );
        return;
    }

    lobby.gameState.roundEndTrigger = undefined;

    lobby.gameState.currentRoundAnswers.forEach((v, k) => {
        if (!lobby.gameState.started) {
            abortLobby(
                lobby,
                "Game state invariant violated while running game loop: game is not started (foreach)"
            );
            return;
        } else if (lobby.gameState.currentQuestionIndex === undefined) {
            abortLobby(
                lobby,
                "Game state invariant violated while running game loop: theres no question index (foreach)"
            );
            return;
        } else if (!lobby.quizData) {
            abortLobby(
                lobby,
                "Game state invariant violated while running game loop: there's no quiz data (foreach)"
            );
            return;
        }

        const answerTimeDiff = Date.now() - v.answerTime;

        const foundUser = lobby.members
            .values()
            .find((user) => user.data.lobbyUserData.userId === k);

        if (!foundUser) {
            abortLobby(
                lobby,
                "Game state invariant violated while running game loop: finding user with id failed"
            );
            return;
        }

        const isCorrect =
            lobby.quizData.cards[lobby.gameState.currentQuestionIndex]
                .correct_answer_index === v.answerIndex;

        isCorrect
            ? foundUser.data.lobbyUserData.stats.correctAnswerCount++
            : foundUser.data.lobbyUserData.stats.wrongAnswerCount++;

        foundUser.data.lobbyUserData.stats.score += isCorrect
            ? calculateScore(answerTimeDiff)
            : 0;
    });

    sendLobby(lobby.members, "roundended", {
        correct_answer_index,
        answers: lobby.gameState.currentRoundAnswers,
        scores: lobby.members
            .values()
            .map((u) => u.data.lobbyUserData)
            .toArray(),
    });
}

function calculateScore(answerTimeDiff: number) {
    const baseScore = 500;

    const timeMultiplier = Math.max(0, 1 - answerTimeDiff / 15000);

    return Math.round(baseScore * (timeMultiplier + 1));
}
