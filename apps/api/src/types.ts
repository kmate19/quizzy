import type { JWTPayload } from "hono/utils/jwt/types";

export type QuizzyJWTPAYLOAD = {
    userId: string;
    refreshTokenId: number,
    exp: number;
} & JWTPayload;

type ApiErrorCase = 'validation' | 'auth' | 'server' | 'not_found' | 'forbidden' | 'conflict' | 'bad_request' | 'unauthorized';

type ApiError = {
    message: string;
    case: ApiErrorCase;
    field?: string;
}

export interface ApiResponse<T = unknown> {
    message: string;
    data?: T;
    error?: ApiError;
    meta?: {
        timestam?: number;
        path?: string;
        pagination?: {
            page: number;
            total: number;
            limit: number;
            offset: number;
        }
    }
}
