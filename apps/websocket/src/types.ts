import type { JWTPayload } from "hono/utils/jwt/types";
import type { LobbyUser as lob } from "repo";

export type QuizzyJWTPAYLOAD = {
    userId: string;
    refreshTokenId: number;
    exp: number;
} & JWTPayload;

export type LobbyUser = Partial<lob> & {
    userId: string;
    stats: {
        placement?: number;
        correctAnswerCount: number;
        wrongAnswerCount: number;
    };
};
