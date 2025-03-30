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
    save.reconnecting = false;

    newWs.data.lobbyUserData = save;
    newWs.subscribe(lobbyid);
    lobby.members.add(newWs);

    if (lobby.gameState.started) {
        const reconnectData = {
            currentQuestion:
                lobby.quizData?.cards[lobby.gameState.currentQuestionIndex!],
            currentRoundAnswers: lobby.gameState.currentRoundAnswers,
            roundTimeLeftMs:
                lobby.gameState.roundTimeStartedEpoch! - Date.now(),
        };
        sendSingle(newWs, "gamestate", reconnectData);
    }
}
