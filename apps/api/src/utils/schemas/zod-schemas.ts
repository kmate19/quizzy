import { Equal } from "drizzle-orm";
import { ApiError, ApiResponse } from "repo";
import { z } from "zod";

// ignore this, just doing typescript magic to check if the types are correct
// eslint-disable-next-line
function assertequal<T extends true>() {}

export const numericString = z.string().regex(/^\d+$/).transform(Number);

export const pagination = z.object({
    limit: numericString.refine((num) => num < 51 && num > 9).optional(),
    page: numericString.optional(),
});

export const tagNames = z.string().nonempty().array().nonempty().optional();

export const tagNamesQuery = tagNames.or(z.string().nonempty().optional());

export const languageISOCodes = z
    .string()
    .length(2)
    .array()
    .nonempty()
    .optional();

export const languageISOCodesQuery = languageISOCodes.or(
    z.string().length(2).optional()
);

export const ApiErrorSchema = z.object({
    message: z.string(),
    case: z.enum([
        "bad_request",
        "validation",
        "unauthorized",
        "auth",
        "forbidden",
        "not_found",
        "conflict",
        "server",
    ]),
    field: z.string().optional(),
});

export const ApiResponseSchema = z.object({
    message: z.string(),
    data: z.custom().optional(),
    error: ApiErrorSchema.optional(),
    meta: z
        .object({
            timestamp: z.number().optional(),
            path: z.string().optional(),
            pagination: z
                .object({
                    page: z.number(),
                    total: z.number(),
                    limit: z.number(),
                    offset: z.number(),
                })
                .optional(),
        })
        .optional(),
});

type ApiErrorSchemaType = z.infer<typeof ApiErrorSchema>;

// eslint-disable-next-line
let _valid1: Equal<ApiErrorSchemaType, ApiError>;
assertequal<typeof _valid1>();

type ApiResponseSchemaType = z.infer<typeof ApiResponseSchema>;

// eslint-disable-next-line
let _valid2: Equal<ApiResponseSchemaType, ApiResponse>;
assertequal<typeof _valid2>();
