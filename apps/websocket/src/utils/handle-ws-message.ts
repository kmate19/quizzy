import {
    publishQuizSchemaWID,
    quizAnswerSchema,
    UserDataSchema,
} from "@/schemas/zodschemas";
import { LobbyMap, LobbyUser } from "@/types";
import { ServerWebSocket } from "bun";
import { WebsocketMessage } from "repo";
import { jumbleIndicesIntoIter } from "./utils";
import { startGameLoop } from "./start-game";
import { abortLobby, closeWithError } from "./close";
import { publishWs, sendLobby, sendSingle } from "./send";

export async function handleWsMessage(
    ws: ServerWebSocket<LobbyUser>,
    msg: WebsocketMessage,
    lobbyid: string,
    lobbies: LobbyMap
) {
    console.log(`client sent message {} to ${lobbyid}`, msg);

    const lobby = lobbies.get(lobbyid)!;
    const members = lobby.members;

    switch (msg.type) {
        case "members":
            const rest = members
                .values()
                .filter((m) => m !== ws)
                .map((u) => u.data.lobbyUserData)
                .toArray();

            sendSingle(ws, "members", rest);

            return;
        case "quizdata":
            const maybeQuizData = publishQuizSchemaWID.safeParse(msg.data);

            if (maybeQuizData.error) {
                closeWithError(ws, "Bad data: quiz");
                return;
            }

            lobby.quizData = maybeQuizData.data;
        case "quizmeta":
            const quizData = lobbies.get(lobbyid)?.quizData;

            if (!quizData) {
                closeWithError(
                    ws,
                    "Quiz data was not provided to the server by the host"
                );
                return;
            }

            sendSingle(ws, "quizmeta", quizData);

            return;
        case "whoami":
            const maybeUserData = UserDataSchema.safeParse(msg.data);

            if (maybeUserData.error) {
                closeWithError(ws, "Bad data: user", 1007, maybeUserData.error);
                return;
            }

            ws.data.lobbyUserData.pfp = maybeUserData.data.pfp;
            ws.data.lobbyUserData.username = maybeUserData.data.username;

            return;
        case "startgame":
            // host sent message to start game, get ready to start game and
            // load quiz data setup up listeners etc then broadcast gamestarted msg

            if (!lobby || !lobby.quizData) {
                closeWithError(
                    ws,
                    "Lobby not found or in an incomplete state to start game"
                );
                return;
            }

            lobby.gameState.started = true;

            lobby.gameState.questionIndices = jumbleIndicesIntoIter(
                lobby.quizData.cards.length
            );

            sendLobby(lobby.members, "gamestarted");

            startGameLoop(lobby);

            return;
        case "answered":
            if (
                !lobby?.gameState.started ||
                !lobby.gameState.currentRoundAnswers
            ) {
                abortLobby(
                    lobby,
                    "Game state invariant violated: answer before game started"
                );
                return;
            }

            const maybeAnswer = quizAnswerSchema.safeParse(msg.data);

            if (maybeAnswer.error) {
                closeWithError(ws, "Bad data: answer", 1007, maybeAnswer.error);
                return;
            }

            if (
                lobby.gameState.currentRoundAnswers.size + 1 <
                lobby.members.size
            ) {
                lobby.gameState.currentRoundAnswers.set(
                    ws.data.lobbyUserData.userId,
                    {
                        answerIndex: maybeAnswer.data.answerIndex,
                        answerTime: maybeAnswer.data.answerTime,
                    }
                );

                if (
                    lobby.gameState.currentRoundAnswers.size ===
                    lobby.members.size
                ) {
                    if (!lobby.gameState.roundEndTrigger) {
                        abortLobby(
                            lobby,
                            "Game state invariant violated: all answers are in but there's no round end trigger"
                        );
                        return;
                    }
                    lobby.gameState.roundEndTrigger();
                }
            }

            return;
        case "subscribe":
        case "unsubscribe":
        case "ping":
        case "pong":
        case "ack":
        case "connect":
            publishWs(ws, lobbyid, "connect", ws.data.lobbyUserData);

            return;
        case "disconnect":
            publishWs(ws, lobbyid, "disconnect", ws.data.lobbyUserData);

            return;
        case "handshake":
        case "error":
    }
}
