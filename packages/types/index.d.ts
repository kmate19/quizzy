declare type ApiErrorCase =
    | "validation"
    | "auth"
    | "server"
    | "not_found"
    | "forbidden"
    | "conflict"
    | "bad_request"
    | "unauthorized";

declare type ApiError = {
    message: string;
    case: ApiErrorCase;
    field?: string;
};

export declare type ApiResponse<T = unknown> = {
    message: string;
    data?: T;
    error?: ApiError;
    meta?: {
        timestamp?: number;
        path?: string;
        pagination?: {
            page: number;
            total: number;
            limit: number;
            offset: number;
        };
    };
};

export declare type LobbyUser = {
    username: string;
    pfp: string;
};

declare type WebsocketMessageType =
    | "roundstarted"
    | "roundended"
    | "gamended"
    | "gamestarted"
    | "startgame"
    | "quizmeta"
    | "quizdata"
    | "members"
    | "whoami"
    | "subscribe"
    | "unsubscribe"
    | "ping"
    | "pong"
    | "ack"
    | "connect"
    | "disconnect"
    | "handshake"
    | "error";

declare type WebsocketError = {
    message: string;
    raw?: string | Error;
};

export declare type WebsocketMessage<T = unknown> = {
    type: WebsocketMessageType;
    successful: boolean;
    server: boolean;
    error?: WebsocketError;
    data?: T;
    clientId?: string; // Unique client identifier assigned by the server
    ext?: {
        ack?: boolean; // Acknowledgment request
        timesync?: {
            l: number; // Latency
            o: number; // Offset
            tc?: number; // Client timestamp
            ts?: number; // Server timestamp
            p?: number; // Server processing time
        };
    };
};
