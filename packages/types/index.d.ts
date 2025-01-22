type ApiErrorCase = 'validation' | 'auth' | 'server' | 'not_found' | 'forbidden' | 'conflict' | 'bad_request' | 'unauthorized';

type ApiError = {
    message: string;
    case: ApiErrorCase;
    field?: string;
}

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
        }
    }
}
