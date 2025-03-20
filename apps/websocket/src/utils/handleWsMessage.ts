import { publishQuizSchemaWID, UserDataSchema } from "@/schemas/zodschemas";
import { LobbyMap, LobbyUser } from "@/types";
import { ServerWebSocket } from "bun";
import { WebsocketMessage } from "repo";
import { jumbleIndicesIntoIter } from "./utils";
import { startGameLoop } from "./startGame";
import { z } from "zod";
import { numericStringSchema } from "@repo/api/public-schemas";

export async function handleWsMessage(
    ws: ServerWebSocket<LobbyUser>,
    msg: WebsocketMessage,
    lobbyid: string,
    lobbies: LobbyMap
) {
    console.log(`client sent message {} to ${lobbyid}`, msg);

    switch (msg.type) {
        case "members":
            const members = lobbies.get(lobbyid)?.members;

            if (!members) {
                const res = {
                    type: "error",
                    successful: false,
                    server: true,
                    error: {
                        message: "Lobby not found",
                    },
                } satisfies WebsocketMessage;

                ws.send(JSON.stringify(res));
                ws.close(1003, "Lobby not found");
                return;
            }

            const rest = members
                .values()
                .filter((m) => m !== ws)
                .toArray();

            const res1 = {
                type: "members",
                successful: true,
                server: true,
                data: rest,
            } satisfies WebsocketMessage;

            ws.send(JSON.stringify(res1));

            return;
        case "quizdata":
            // VALSZEG ITT AZ ERROR
            const maybeQuizData = publishQuizSchemaWID.safeParse(msg.data);

            if (maybeQuizData.error) {
                const res = {
                    type: "error",
                    successful: false,
                    server: true,
                    error: {
                        message: "Bad data",
                    },
                } satisfies WebsocketMessage;

                ws.send(JSON.stringify(res));
                ws.close(1003, "Bad quizdata");
                return;
            }

            if (!lobbies.has(lobbyid)) {
                const res = {
                    type: "error",
                    successful: false,
                    server: true,
                    error: {
                        message: "Lobby not found",
                    },
                } satisfies WebsocketMessage;

                ws.send(JSON.stringify(res));
                ws.close(1003, "Lobby not found");
                return;
            }

            lobbies.get(lobbyid)!.quizData = maybeQuizData.data;
        case "quizmeta":
            // send quizData to all members

            const quizData = lobbies.get(lobbyid)?.quizData;

            if (!quizData) {
                const res = {
                    type: "error",
                    successful: false,
                    server: true,
                    error: {
                        message: "Quiz data not found",
                    },
                } satisfies WebsocketMessage;

                ws.send(JSON.stringify(res));
                ws.close(1003, "Quiz data not found");
                return;
            }

            const res2 = {
                type: "quizmeta",
                successful: true,
                server: true,
                data: quizData,
            } satisfies WebsocketMessage;

            ws.publish(lobbyid, JSON.stringify(res2));
            return;
        case "whoami":
            const maybeUserData = UserDataSchema.safeParse(msg.data);

            if (maybeUserData.error) {
                const res = {
                    type: "error",
                    successful: false,
                    server: true,
                    error: {
                        message: "Bad data",
                    },
                } satisfies WebsocketMessage;

                ws.send(JSON.stringify(res));
                ws.close(1003, "Bad userdata");
                return;
            }

            const { username, pfp } = maybeUserData.data;

            ws.data.lobbyUserData.pfp = pfp;
            ws.data.lobbyUserData.username = username;

            return;
        case "startgame":
            // host sent message to start game, get ready to start game and
            // load quiz data setup up listeners etc then broadcast gamestarted msg

            const lobby = lobbies.get(lobbyid);

            if (!lobby || !lobby.quizData) {
                const res = {
                    type: "error",
                    successful: false,
                    server: true,
                    error: {
                        message: "Lobby not found or incomplete to start game",
                    },
                } satisfies WebsocketMessage;

                ws.send(JSON.stringify(res));
                ws.close(1003, "Lobby not found or incomplete to start game");
                return;
            }

            lobby.gameState.started = true;

            lobby.gameState.questionIndices = jumbleIndicesIntoIter(
                lobby.quizData.cards.length
            );

            const res3 = {
                type: "gamestarted",
                successful: true,
                server: true,
            } satisfies WebsocketMessage;

            ws.send(JSON.stringify(res3));
            ws.publish(lobbyid, JSON.stringify(res3));

            startGameLoop(lobby);

            return;
        case "answered":
            if (!lobby?.gameState.started) {
                ws.close(1003, "invalid state");
                return;
            }

            const maybeAnswer = numericStringSchema.safeParse(msg.data);

            if (maybeAnswer.error) {
                const res = {
                    type: "error",
                    successful: false,
                    server: true,
                    error: {
                        message: "invalid answer",
                    },
                } satisfies WebsocketMessage;

                ws.send(JSON.stringify(res));
                ws.close(1003, "invalid answer");
                return;
            }

            if (!lobby.gameState.currentRoundAnswers) {
                ws.close(1003, "invalid state");
                return;
            }

            if (
                lobby.gameState.currentRoundAnswers.size + 1 <
                lobby.members.size
            ) {
                lobby.gameState.currentRoundAnswers.set(
                    ws.data.lobbyUserData.userId,
                    maybeAnswer.data
                );

                if (
                    lobby.gameState.currentRoundAnswers.size ===
                    lobby.members.size
                ) {
                    lobby.gameState.roundEndTrigger?.();
                }
            }

        case "subscribe":
        case "unsubscribe":
        case "ping":
        case "pong":
        case "ack":
        case "connect":
            console.log("connectl", ws.data);
            const joinBroadcastMsg = {
                type: "connect",
                successful: true,
                server: true,
                data: ws.data.lobbyUserData,
            } satisfies WebsocketMessage;

            ws.publish(lobbyid, JSON.stringify(joinBroadcastMsg));

            return;
        case "disconnect":
            const disconnectBroadcastMsg = {
                type: "disconnect",
                successful: true,
                server: true,
                data: ws.data.lobbyUserData,
            } satisfies WebsocketMessage;

            ws.publish(lobbyid, JSON.stringify(disconnectBroadcastMsg));

            return;
        case "handshake":
        case "error":
    }
}
