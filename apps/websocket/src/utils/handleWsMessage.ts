import { UserDataSchema } from "@/schemas/zodschemas";
import { LobbyUser } from "@/types";
import { ServerWebSocket } from "bun";
import { WebsocketMessage } from "repo";

export async function handleWsMessage(
    ws: ServerWebSocket<LobbyUser>,
    msg: WebsocketMessage,
    lobbyid: string
) {
    console.log(`client sent message {} to ${lobbyid}`, msg);

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

            ws.data.lobbyUserData.pfp = pfp;
            ws.data.lobbyUserData.username = username;

            return;
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

            //lobbies.get(lobbyid)?.forEach((client) => {
            //    if (client.data.userId !== ws.data.userId) {
            //        client.send(JSON.stringify(joinBroadcastMsg));
            //    }
            //});

            return;
        case "disconnect":
            const disconnectBroadcastMsg = {
                type: "disconnect",
                successful: true,
                server: true,
                data: ws.data.lobbyUserData,
            } satisfies WebsocketMessage;

            ws.publish(lobbyid, JSON.stringify(disconnectBroadcastMsg));

            //lobbies.get(lobbyid)?.forEach((client) => {
            //    if (client.data.userId !== ws.data.userId) {
            //        client.send(JSON.stringify(joinBroadcastMsg));
            //    }
            //});

            return;
        case "handshake":
        case "error":
    }
}
