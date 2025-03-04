// re export public stuff

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

import {
    RegisterUserSchema as ru,
    LoginUserSchema as lu,
    UserInferSelectRaw,
    LangugeInferSelectRaw,
    UserTokensInferSelectRaw,
    UserStatsInferSelectRaw,
    UserApiKeyInferSelectRaw,
    TagInferSelectRaw,
    RolesInferSelectRaw,
    QuizInfertSelectRaw,
    QuizCardInferSelectRaw,
    FriendshipInferSelectRaw,
    ReviewsInferSelectRaw,
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

const _user = UserInferSelectRaw;
const _usertoken = UserTokensInferSelectRaw;
const _userstats = UserStatsInferSelectRaw;
const _userapikey = UserApiKeyInferSelectRaw;
const _tag = TagInferSelectRaw;
const _role = RolesInferSelectRaw;
const _language = LangugeInferSelectRaw;
const _review = ReviewsInferSelectRaw;
const _quiz = QuizInfertSelectRaw;
const _quizcard = QuizCardInferSelectRaw;
const _friendship = FriendshipInferSelectRaw;

export type Language = typeof _language;
export type User = typeof _user;
export type UserTokens = typeof _usertoken;
export type UserStats = typeof _userstats;
export type UserApiKey = typeof _userapikey;
export type Tag = typeof _tag;
export type Role = typeof _role;
export type Review = typeof _review;
export type Quiz = typeof _quiz;
export type QuizCard = typeof _quizcard;
export type Friendship = typeof _friendship;

// note: oszinten annyira nem ertem mi tortenik:
//
// // usersSchema.ts
// export type User = typeof usersTable.$inferSelect;
// export const UserInferSelectRaw = usersTable.$inferSelect;
//
// ha most innen az elso sor kodot exportoljuk es hasznaljuk itt (lasd import type sorozat par sorral lejjebb)
// akkor nem fog mukodoni, mivel az outputba build utan ez igy jelenik meg:
//
// "import type {User} from './db/schemas'"
//
// import type {
//    User as ut,
// } from "./db/schemas";
// export const User = ut;
//
// ez azt eredmenyezi hogy az output fajlunkba van meg egy import
// ami miatt utana megfogja azokat az exportokat is amit itt nem exportolunk,
// viszont a db/schemas-ba exportolva vannak tehat side effect, amikor ezt importolni akarjuk
// masik packageben akkor latjuk a tobbi exportot is ami abba a modulba van es ezeket
// relative utvonallal akarja behuzni ami ugye nem a vart viselkedes
//
// a masodik sor kod mukodik ahogy kene es csak az az 1 objektum importolodik be
// nem hoz magaval semmi side effectet ez igy nez ki az outputban:
//
// export declare const User: {
//    email: string;
//    id: string;
//    username: string;
//    password: string;
//    activity_status: "active" | "inactive" | "away";
//    profile_picture: Buffer<ArrayBufferLike> | null;
//    auth_status: "active" | "pending" | "blocked";
//    firstTimeLogin: boolean | null;
//    created_at: Date;
//    updated_at: Date;
// };
//
// ----- hogy ez miert van? fogalmam sincs de igy tudom megoldani jelenleg
// ha typekent akarod akkor miutan be exportolod szedd ki a typeot belole
// typeof syntaxxal ----- MEGSE!
//
// megoldas:
//
// const _user = UserInferSelectRaw;
// export type User = typeof _user;
//
// az importot egy uj lokalis valtozoba elmentjuk amit nem hasznalunk semmi masra
// majd ennek a typeofjat exportoljuk typekent, es ugy mukodik,
// az outputban ez lathato igy build utan:
//
// declare const _exvar: {
//    email: string;
//    id: string;
//    username: string;
//    password: string;
//    activity_status: "active" | "inactive" | "away";
//    profile_picture: Buffer<ArrayBufferLike> | null;
//    auth_status: "active" | "pending" | "blocked";
//    firstTimeLogin: boolean | null;
//    created_at: Date;
//    updated_at: Date;
// };
// export type User = typeof _exvar;
// export {};
//
// es nincsenek import statementek tehat jok vagyunk hat ez eleg cringe
// valaki magyarazza miert van igy
// (vagy elvileg ha full elkulonitjuk a typeokat egy d.ts fajlba akkor nem igy mukodnek a typeof dolgok de ezt nemtudom most)
