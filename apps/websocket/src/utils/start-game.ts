import { Lobby } from "@/types";
import { abortLobby } from "./close";
import { sendLobby } from "./send";
import { handleRoundEnd } from "./handle-roundend";

export async function startGameLoop(lobby: Lobby): Promise<void> {
    if (!lobby.gameState.questionIndices) {
        abortLobby(
            lobby,
            "Game state invariant violated while running game loop: questionIndices is undefined"
        );
        return;
    }

    let index = lobby.gameState.questionIndices.next();

    lobby.gameState.currentRoundAnswers = new Map();

    while (!index.done) {
        lobby.gameState.currentQuestionIndex = index.value;

        const { correct_answer_index, ...rest } =
            lobby.quizData!.cards[lobby.gameState.currentQuestionIndex];

        sendLobby(
            lobby.members,
            "roundstarted",
            Object.assign(rest, { roundTimeMs: 15000 })
        );

        await new Promise<void>((resolve) => {
            lobby.gameState.roundEndTrigger = resolve;

            lobby.gameState.roundEndTimeout = setTimeout(() => {
                handleRoundEnd(lobby, correct_answer_index);

                resolve();
            }, 15000);
        });

        handleRoundEnd(lobby, correct_answer_index);
    }

    // game ended here
}
