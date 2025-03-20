import { Lobby, LobbyUser } from "@/types";
import { abortLobby } from "./close";
import { sendLobby } from "./send";

export function handleRoundEnd(lobby: Lobby, correct_answer_index: number) {
    lobby.gameState.roundEndTrigger = undefined;

    lobby.gameState.currentRoundAnswers!.forEach((v, k) => {
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
            lobby.quizData?.cards[lobby.gameState.currentQuestionIndex!]
                .correct_answer_index === v.answerIndex;

        isCorrect
            ? foundUser.data.lobbyUserData.stats.correctAnswerCount++
            : foundUser.data.lobbyUserData.stats.wrongAnswerCount++;

        foundUser.data.lobbyUserData.stats.score =
            calculateScore(answerTimeDiff);
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

    const baseMult = 1.0;

    const timeMult = answerTimeDiff / 10000;

    return baseScore * (baseMult + timeMult);
}
