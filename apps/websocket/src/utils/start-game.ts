import { Lobby } from "@/types";
import { abortLobby } from "./close";
import { sendLobby } from "./send";
import { handleRoundEnd } from "./handle-roundend";
import { handleGameEnd } from "./handle-gameend";

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

        await new Promise<void>((resolve, reject) => {
            lobby.gameState.roundEndTrigger = reject;

            lobby.gameState.roundEndTimeout = setTimeout(() => {
                handleRoundEnd(lobby, correct_answer_index);

                resolve();
            }, 15000);
        }).catch(() => {
            // NOTE: this catch block is not actually for error handling but
            // for maunally triggering the game end using reject
            // if we triggered it after the callback it would double trigger
            clearTimeout(lobby.gameState.roundEndTimeout);
            handleRoundEnd(lobby, correct_answer_index);
        });

        index = lobby.gameState.questionIndices.next();
        lobby.gameState.currentRoundAnswers = new Map();
    }

    handleGameEnd(lobby);
}
