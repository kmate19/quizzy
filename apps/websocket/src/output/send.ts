import { LobbyUser } from "@/types";
import { ServerWebSocket } from "bun";
import { WebsocketMessage, WebsocketMessageType } from "repo";

export function sendSingle(
    ws: ServerWebSocket<any>,
    type: WebsocketMessageType,
    data?: unknown,
    successful: boolean = true
) {
    const res = {
        type,
        successful,
        server: true,
        data,
    } satisfies WebsocketMessage;

    ws.send(JSON.stringify(res));
}

/**
 * NOTE This does not send to self
 */
export function publishWs(
    ws: ServerWebSocket<any>,
    topic: string,
    type: WebsocketMessageType,
    data?: unknown,
    successful: boolean = true
) {
    const res = {
        type,
        successful,
        server: true,
        data,
    } satisfies WebsocketMessage;

    console.log("sending to topic", topic, res.type);

    ws.publish(topic, JSON.stringify(res));
}

/**
 * NOTE This also sends to self
 */
export function sendLobby(
    members: Set<ServerWebSocket<LobbyUser>>,
    type: WebsocketMessageType,
    data?: unknown,
    successful: boolean = true
) {
    const res = {
        type,
        successful,
        server: true,
        data,
    } satisfies WebsocketMessage;

    members.values().forEach((u) => {
        u.send(JSON.stringify(res));
    });
}
