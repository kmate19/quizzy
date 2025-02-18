import type { JWTPayload } from "hono/utils/jwt/types";

export type QuizzyJWTPAYLOAD = {
    userId: string;
    refreshTokenId: number,
    exp: number;
} & JWTPayload;

export type PGError = {
    message: string;
    columnName: string;
    type: "dup";
};
