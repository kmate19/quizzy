import { QuizzyJWTPAYLOAD } from "@/types";
import { Context } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { JwtTokenExpired } from "hono/utils/jwt/types";
import type { ApiResponse } from "repo";
import ENV from "./env";

export async function extractJwtData(c: Context) {
    const accessCookie = getCookie(c, ENV.ACCESS_COOKIE_NAME());

    if (!accessCookie) {
        const res = {
            message: "not logged in",
            error: {
                message: "not logged in",
                case: "unauthorized",
            },
        } satisfies ApiResponse;
        return c.json(res, 401);
    }

    const accessTokenPayloadOrError = (await verify(
        accessCookie,
        ENV.ACCESS_JWT_SECRET()
    ).catch((e) => e)) as QuizzyJWTPAYLOAD;

    if (accessTokenPayloadOrError instanceof JwtTokenExpired) {
        const res = {
            message: "not logged in",
            error: {
                message: "not logged in",
                case: "unauthorized",
            },
        } satisfies ApiResponse;
        return c.json(res, 401);
    } else if (accessTokenPayloadOrError instanceof Error) {
        throw accessTokenPayloadOrError;
    }

    return accessTokenPayloadOrError;
}
