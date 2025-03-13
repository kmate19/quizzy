import { UserDataSchema } from "@/schemas/zodschemas";
import { LobbyUser } from "@/types";
import { ServerWebSocket } from "bun";
import { WebsocketMessage } from "repo";

export async function handleWsMessage(
    ws: ServerWebSocket<LobbyUser>,
    msg: WebsocketMessage,
    lobbyid: string
) {
    console.log(`client sent message ${msg} {lobbyid}`);

    switch (msg.type) {
        case "message":
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
                ws.close(1003, "Lobby does not exist");
                return;
            }

            const { username, pfp } = maybeUserData.data;

            ws.data.pfp = pfp;
            ws.data.username = username;

            return;
        case "subscribe":
        case "unsubscribe":
        case "ping":
        case "pong":
        case "ack":
        case "connect":
        case "disconnect":
        case "handshake":
        case "error":
    }
}
