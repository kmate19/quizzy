import {
    publishQuizSchemaWID,
    quizAnswerSchema,
    UserDataSchema,
} from "@/schemas/zodschemas";
import { LobbyMap, LobbyUser } from "@/types";
import { ServerWebSocket } from "bun";
import { WebsocketMessage } from "repo";
import { startGameLoop } from "@/game-loop/start-game";
import { abortLobby, closeWithError } from "@/output/close";
import { publishWs, sendLobby, sendSingle } from "@/output/send";
import { z } from "zod";

export async function handleWsMessage(
    ws: ServerWebSocket<LobbyUser>,
    msg: WebsocketMessage,
    lobbyid: string,
    lobbies: LobbyMap
) {
    const lobby = lobbies.get(lobbyid)!;
    const members = lobby.members;

    switch (msg.type) {
        case "sendchatmessage":
            const maybeChatMessage = z.string().max(100).safeParse(msg.data);

            if (maybeChatMessage.error) {
                closeWithError(
                    ws,
                    "Bad data: chat message",
                    1007,
                    maybeChatMessage.error
                );
                return;
            }

            const chatMessage = {
                name: ws.data.lobbyUserData.username,
                pfp: ws.data.lobbyUserData.pfp,
                message: maybeChatMessage.data,
            };

            publishWs(ws, lobbyid, "recvchatmessage", chatMessage);

            return;
        case "members":
            const rest = members
                .values()
                .filter((m) => m !== ws)
                .map((u) => {
                    const { pongTimeout, ...rest } = u.data.lobbyUserData;
                    return rest;
                })
                .toArray();

            const memb = {
                host: lobby.gameState.hostId,
                members: rest,
            };

            sendSingle(ws, "members", memb);

            return;
        case "leave":
            ws.data.lobbyUserData.canRecconnect = false;
            return;
        case "quizdata":
            if (lobby.gameState.hostId !== ws.data.lobbyUserData.userId) {
                closeWithError(ws, "You are not the host");
                return;
            }

            const maybeQuizData = publishQuizSchemaWID.safeParse(msg.data);

            if (maybeQuizData.error) {
                closeWithError(ws, "Bad data: quiz", 1007, maybeQuizData.error);
                return;
            }

            lobby.quizData = maybeQuizData.data;

            return;
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
            if (lobby.gameState.hostId !== ws.data.lobbyUserData.userId) {
                closeWithError(ws, "You are not the host");
                return;
            }

            if (!lobby || !lobby.quizData) {
                closeWithError(
                    ws,
                    "Lobby not found or in an incomplete state to start game"
                );
                return;
            }

            if (lobby.gameState.started) {
                closeWithError(ws, "Game already started");
                return;
            }

            lobby.gameState = {
                hostId: lobby.gameState.hostId,
                started: true,
                roundNum: 0,
                roundTimeMs: 15000,
                questionIndices: jumbleIndicesIntoIter(
                    lobby.quizData.cards.length
                ),
                currentRoundAnswers: new Map(),
            };

            sendLobby(lobby.members, "gamestarted");

            startGameLoop(lobby);

            return;
        case "answered":
            if (
                !lobby.gameState.started ||
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

            // prevent race conditions
            setImmediate(() => {
                if (lobby.gameState.started) {
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
                } else {
                    abortLobby(
                        lobby,
                        "Game state invariant violated: answer before game started"
                    );
                }
            });

            return;
        case "kick":
            if (lobby.gameState.hostId !== ws.data.lobbyUserData.userId) {
                closeWithError(ws, "You are not the host");
                return;
            }

            const maybeKickedData = UserDataSchema.pick({
                username: true,
            }).safeParse(msg.data);

            if (maybeKickedData.error) {
                closeWithError(
                    ws,
                    "Bad data: user",
                    1007,
                    maybeKickedData.error
                );
                return;
            }

            const kickedUser = members
                .values()
                .find(
                    (m) =>
                        m.data.lobbyUserData.username ===
                        maybeKickedData.data.username
                );

            if (!kickedUser) {
                closeWithError(ws, "User not found");
                return;
            }

            kickedUser.data.lobbyUserData.canRecconnect = false;

            closeWithError(kickedUser, "You have been kicked");

            return;
        case "ping":
            sendSingle(ws, "pong");

            return;
        case "pong":
            clearTimeout(ws.data.lobbyUserData.pongTimeout);
            ws.data.lobbyUserData.pongTimeout = setTimeout(() => {
                closeWithError(ws, "Pong timeout", 1001);
            }, 20000);

            return;
        case "connect":
            publishWs(ws, lobbyid, "connect", ws.data.lobbyUserData);

            return;
    }
}

function jumbleIndicesIntoIter(length: number) {
    const indices = new Set<number>();

    while (indices.size < length) {
        indices.add(Math.floor(Math.random() * length));
    }

    return Iterator.from(indices.values());
}
