import { Lobby } from "@/types";
import { WebsocketMessage } from "repo";

export async function startGameLoop(lobby: Lobby): Promise<void> {
    if (!lobby.gameState.questionIndices) {
        // TODO: actually handle this case
        throw new Error("question indices not set but game started");
    }

    let index = lobby.gameState.questionIndices.next();

    lobby.gameState.currentRoundAnswers = new Map();

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
                lobby.gameState.roundEndTrigger = undefined;

                lobby.gameState.currentRoundAnswers?.forEach((v, k) => {
                    if (!lobby.gameState.currentQuestionIndex) {
                        // TODO: actually handle this case
                        throw new Error("no current question");
                    }

                    const foundUser = lobby.members
                        .values()
                        .find((user) => user.data.lobbyUserData.userId === k);

                    if (!foundUser) {
                        // TODO: actually handle this case
                        throw new Error("no user found with the id");
                    }

                    const isCorrect =
                        lobby.quizData?.cards[
                            lobby.gameState.currentQuestionIndex
                        ].correct_answer_index === v;

                    isCorrect
                        ? foundUser.data.lobbyUserData.stats
                              .correctAnswerCount++
                        : foundUser.data.lobbyUserData.stats.wrongAnswerCount++;
                });

                lobby.members.forEach((m) => {
                    m.send(
                        JSON.stringify({
                            type: "roundended",
                            successful: true,
                            server: true,
                            data: {
                                correct_answer_index,
                                answers: lobby.gameState.currentRoundAnswers,
                                scores: lobby.members
                                    .values()
                                    .map((u) => u.data.lobbyUserData)
                                    .toArray(),
                            },
                        } satisfies WebsocketMessage)
                    );
                });

                resolve();
            }, 15000);
        });

        lobby.gameState.roundEndTrigger = undefined;

        // calculate scores of users and see if their answers are correct

        lobby.gameState.currentRoundAnswers.forEach((v, k) => {
            if (!lobby.gameState.currentQuestionIndex) {
                // TODO: actually handle this case
                throw new Error("no current question");
            }

            const foundUser = lobby.members
                .values()
                .find((user) => user.data.lobbyUserData.userId === k);

            if (!foundUser) {
                // TODO: actually handle this case
                throw new Error("no user found with the id");
            }

            const isCorrect =
                lobby.quizData?.cards[lobby.gameState.currentQuestionIndex]
                    .correct_answer_index === v;

            isCorrect
                ? foundUser.data.lobbyUserData.stats.correctAnswerCount++
                : foundUser.data.lobbyUserData.stats.wrongAnswerCount++;
        });

        lobby.members.forEach((m) => {
            m.send(
                JSON.stringify({
                    type: "roundended",
                    successful: true,
                    server: true,
                    data: {
                        correct_answer_index,
                        answers: lobby.gameState.currentRoundAnswers,
                        scores: lobby.members
                            .values()
                            .map((u) => u.data.lobbyUserData)
                            .toArray(),
                    },
                } satisfies WebsocketMessage)
            );
        });
    }

    // game ended here
}
