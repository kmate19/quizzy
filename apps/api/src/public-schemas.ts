import {
    ApiErrorSchema as aes,
    ApiResponseSchema as ars,
    tagNamesSchema as tns,
    tagNamesQuerySchema as tnqs,
    languageISOCodesSchema as lics,
    languageISOCodesQuerySchema as liqs,
    paginationSchema as ps,
    numericStringSchema as ns,
    searchQuerySchema as sqs,
    trueStringSchema as tss,
    publishQuizSchema as pqs,
    editQuizSchema as eqs,
    changePasswordSchema as cps,
} from "./utils/schemas/zod-schemas";

import { RegisterUserSchema as ru, LoginUserSchema as lu } from "./db/schemas";
import type {
    Language as lt,
    User as ut,
    UserTokens as utt,
    UserStats as ust,
    UserApiKey as uak,
    Tag as tt,
    Role as rt,
    Review as rvt,
    Quiz as qt,
    QuizCard as qct,
    Friendship as ft,
} from "./db/schemas";

export const ApiResponseSchema = ars;
export const ApiErrorSchema = aes;
export const tagNamesSchema = tns;
export const tagNamesQuerySchema = tnqs;
export const languageISOCodesSchema = lics;
export const languageISOCodesQuerySchema = liqs;
export const paginationSchema = ps;
export const numericStringSchema = ns;
export const searchQuerySchema = sqs;
export const trueStringSchema = tss;
export const publishQuizSchema = pqs;
export const editQuizSchema = eqs;
export const changePasswordSchema = cps;
export const RegisterUserSchema = ru;
export const LoginUserSchema = lu;

export type Language = lt;
export type User = ut;
export type UserTokens = utt;
export type UserStats = ust;
export type UserApiKey = uak;
export type Tag = tt;
export type Role = rt;
export type Review = rvt;
export type Quiz = qt;
export type QuizCard = qct;
export type Friendship = ft;
