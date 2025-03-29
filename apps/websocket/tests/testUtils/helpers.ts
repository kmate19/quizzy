import type { WebsocketMessage, WebsocketMessageType } from "repo";
import { expect } from "bun:test";

type wsEventHandlers = {
    onmessage?: (
        e: MessageEvent,
        response: WebsocketMessage
    ) => { success: boolean; canResolve: boolean } | undefined;
    onopen?: (
        e: Event
    ) => { success: boolean; canResolve: boolean } | undefined;
    onclose?: (
        e: CloseEvent
    ) => { success: boolean; canResolve: boolean } | undefined;
};

export function createWebsocketEnv(
    wsReq: WebSocket,
    eventHandlers: wsEventHandlers,
    ignoredMessageTypes?: WebsocketMessageType[],
    timeoutMs: number = 1000
): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const ws = wsReq;

        const timeout = setTimeout(() => {
            reject(new Error("timeout"));
        }, timeoutMs);

        ws.onopen = (e) => {
            const customHandlerRes = eventHandlers.onopen?.(e);
            if (customHandlerRes) {
                if (customHandlerRes.canResolve) {
                    customHandlerRes.success
                        ? resolve()
                        : reject(new Error("onopen handler returned false"));
                }
            }
        };

        ws.onmessage = (e) => {
            const response = JSON.parse(e.data) as WebsocketMessage;
            if (ignoredMessageTypes?.includes(response.type)) {
                return;
            }
            clearTimeout(timeout);
            try {
                const customHandlerRes = eventHandlers.onmessage?.(e, response);
                if (customHandlerRes) {
                    if (customHandlerRes.canResolve) {
                        customHandlerRes.success
                            ? resolve()
                            : reject(
                                  new Error("onmessage handler returned false")
                              );
                    }
                }
            } catch (e) {
                reject(e);
            }
        };

        ws.onclose = (e) => {
            clearTimeout(timeout);
            try {
                const customHandlerRes = eventHandlers.onclose?.(e);
                if (customHandlerRes) {
                    if (customHandlerRes.canResolve) {
                        customHandlerRes.success
                            ? resolve()
                            : reject(
                                  new Error("onclose handler returned false")
                              );
                    }
                }
            } catch (e) {
                reject(e);
            }
        };
    });
}
