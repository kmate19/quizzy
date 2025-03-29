import { Lobby } from "@/types";
import { abortLobby } from "@/output/close";
import { sendLobby } from "@/output/send";
import { handleRoundEnd } from "./handle-roundend";
import { handleGameEnd } from "./handle-gameend";
import { sleep } from "bun";

export async function startGameLoop(lobby: Lobby): Promise<void> {
    if (!lobby.gameState.started) {
        abortLobby(
            lobby,
            "Game state invariant violated while running game loop: game is not started"
        );
        return;
    }

    let index = lobby.gameState.questionIndices.next();

    while (!index.done) {
        await sleep(1500);

        lobby.gameState.currentQuestionIndex = index.value;

        const { correct_answer_index, ...rest } =
            lobby.quizData!.cards[lobby.gameState.currentQuestionIndex];

        sendLobby(
            lobby.members,
            "roundstarted",
            Object.assign(rest, { roundTimeMs: 15000 })
        );

        await new Promise<void>((resolve, reject) => {
            if (lobby.gameState.started) {
                lobby.gameState.roundEndTrigger = reject;

                lobby.gameState.roundEndTimeout = setTimeout(() => {
                    handleRoundEnd(lobby, correct_answer_index);

                    resolve();
                }, 15000);
            } else {
                abortLobby(
                    lobby,
                    "Game state invariant violated while running game loop: game is not started"
                );
            }
        }).catch(() => {
            // NOTE: this catch block is not actually for error handling but
            // for maunally triggering the game end using reject
            // if we triggered it after the callback it would double trigger
            if (lobby.gameState.started) {
                clearTimeout(lobby.gameState.roundEndTimeout);
                handleRoundEnd(lobby, correct_answer_index);
            } else {
                abortLobby(
                    lobby,
                    "Game state invariant violated while running game loop: game is not started"
                );
            }
        });

        index = lobby.gameState.questionIndices.next();
        lobby.gameState.currentRoundAnswers = new Map();
    }

    handleGameEnd(lobby);
}
