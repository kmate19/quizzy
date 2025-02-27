import {
    ApiErrorSchema as aes,
    ApiResponseSchema as ars,
    tagNamesSchema as tns,
    tagNamesQuerySchema as tnqs,
    languageISOCodesSchema as lics,
    languageISOCodesQuerySchema as liqs,
    paginationSchema as ps,
    numericStringSchema as ns,
} from "./utils/schemas/zod-schemas";

export const ApiResponseSchema = ars;
export const ApiErrorSchema = aes;
export const tagNamesSchema = tns;
export const tagNamesQuerySchema = tnqs;
export const languageISOCodesSchema = lics;
export const languageISOCodesQuerySchema = liqs;
export const paginationSchema = ps;
export const numericStringSchema = ns;
