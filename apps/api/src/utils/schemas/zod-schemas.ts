import {
    insertQuizCardsSchema,
    insertQuizSchema,
    LoginUserSchema,
} from "@/db/schemas";
import { Equal } from "drizzle-orm";
import { ApiError, ApiResponse } from "repo";
import { z } from "zod";

// ignore this, just doing typescript magic to check if the types are correct
// eslint-disable-next-line
function assertequal<T extends true>() {}

export const quizFinishedSchema = z.object({
    userId: z.string().uuid(),
    quizId: z.string().uuid(),
    type: z.literal("solo").or(z.literal("multi")),
    meta: z.object({
        placement: z.number().optional(),
        correctAnswerCount: z.number(),
        wrongAnswerCount: z.number(),
    }),
});

export const numericStringSchema = z.string().regex(/^\d+$/).transform(Number);

export const paginationSchema = z.object({
    limit: numericStringSchema.refine((num) => num < 51 && num > 9).optional(),
    page: numericStringSchema.optional(),
});

export const tagNamesSchema = z
    .string()
    .nonempty()
    .array()
    .nonempty()
    .optional();

export const tagNamesQuerySchema = tagNamesSchema.or(
    z.string().nonempty().optional()
);

export const languageISOCodesSchema = z
    .string()
    .length(2)
    .array()
    .nonempty()
    .optional();

export const languageISOCodesQuerySchema = languageISOCodesSchema.or(
    z.string().length(2).optional()
);

export const trueStringSchema = z.string().transform((a) => {
    return a === "true" ? true : false;
});

export const searchQuerySchema = paginationSchema.merge(
    z.object({
        query: z.string().nonempty().optional(),
        tagNames: tagNamesQuerySchema,
        languageISOCodes: languageISOCodesQuerySchema,
        strict: trueStringSchema.optional(),
    })
);

export const publishQuizSchema = z
    .object({
        quiz: insertQuizSchema,
        cards: insertQuizCardsSchema.array().nonempty().max(10),
        languageISOCodes: languageISOCodesSchema,
        tagNames: tagNamesSchema,
    })
    .required();

export const editQuizSchema = publishQuizSchema.partial();

export const changePasswordSchema = LoginUserSchema.omit({
    username_or_email: true,
}).extend({
    oldPassword: z.string(),
});

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
