import { closeWithError } from "@/output/close";
import { sendSingle } from "@/output/send";
import { Lobby, LobbyUser } from "@/types";
import { ServerWebSocket } from "bun";

export function reconnect(
    oldWs: ServerWebSocket<LobbyUser>,
    newWs: ServerWebSocket<LobbyUser>,
    lobby: Lobby,
    lobbyid: string
) {
    const save = oldWs.data.lobbyUserData;

    lobby.members.delete(oldWs);

    clearTimeout(save.deletionTimeout);
    clearTimeout(save.pongTimeout);
    clearInterval(save.pingInterval);
    save.reconnecting = false;

    newWs.data.lobbyUserData = save;
    newWs.subscribe(lobbyid);
    lobby.members.add(newWs);

    newWs.data.lobbyUserData.pongTimeout = setTimeout(() => {
        closeWithError(newWs, "Pong timeout initial", 1001);
    }, 20000);

    newWs.data.lobbyUserData.pingInterval = setInterval(() => {
        if (newWs.readyState === 3) {
            console.log("client closed clearing interval");
            clearInterval(newWs.data.lobbyUserData.pingInterval);
        } else {
            console.log(
                "sending ping to : ",
                newWs.data.lobbyUserData.username
            );
            sendSingle(newWs, "ping");
        }
    }, 10000);

    if (lobby.gameState.started) {
        const reconnectData = {
            currentQuestion:
                lobby.quizData?.cards[lobby.gameState.currentQuestionIndex!],
            currentRoundAnswers: lobby.gameState.currentRoundAnswers,
            currentRoundIndex: lobby.gameState.roundNum,
            roundTimeLeftMs:
                lobby.gameState.roundTimeMs -
                (Date.now() - lobby.gameState.roundTimeStartedEpoch!),
        };
        sendSingle(newWs, "gamestate", reconnectData);
    }
}
