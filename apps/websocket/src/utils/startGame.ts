import { Lobby } from "@/types";
import { WebsocketMessage } from "repo";

export async function startGameLoop(lobby: Lobby): Promise<void> {
    if (!lobby.gameState.questionIndices) {
        // TODO: actually handle this case
        throw new Error("question indices not set but game started");
    }
    let index = lobby.gameState.questionIndices.next();
    while (!index.done) {
        lobby.gameState.currentQuestionIndex = index.value;

        const { correct_answer_index, ...rest } =
            lobby.quizData!.cards[lobby.gameState.currentQuestionIndex];

        lobby.members.forEach((m) => {
            m.send(
                JSON.stringify({
                    type: "roundstarted",
                    successful: true,
                    server: true,
                    data: Object.assign(rest, {
                        timeMs: 15000,
                    }),
                } satisfies WebsocketMessage)
            );
        });

        await new Promise<void>((resolve) => {
            lobby.gameState.roundEndTrigger = resolve;

            lobby.gameState.roundEndTimeout = setTimeout(() => {
                resolve();
            }, 15000);
        });
    }
}
