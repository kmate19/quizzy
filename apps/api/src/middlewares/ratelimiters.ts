import GLOBALS from "@/config/globals";
import { QuizzyJWTPAYLOAD } from "@/types";
import { Context } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { getConnInfo } from "hono/bun";
import { getCookie } from "hono/cookie";

export function makeRateLimiter(
    timeMinutes: number,
    limit: number,
    hasJwt: boolean | "maybe",
    message?: string,
    skipFailed: boolean = false,
    skipSuccess: boolean = false
) {
    return rateLimiter({
        windowMs: timeMinutes * 60 * 1000,
        limit: limit,
        skipFailedRequests: skipFailed,
        skipSuccessfulRequests: skipSuccess,
        standardHeaders: "draft-7",
        keyGenerator: (c) => {
            const ip = getConnInfo(c).remote.address!;

            console.log(`getconninfo ip (unused): ${ip}`);

            const userAgent = c.req.header("User-Agent");

            console.log(`userAgent: ${userAgent}`);

            const xfor = c.req.header("X-Forwarded-For");

            console.log(`xfor: ${xfor}`);

            if (hasJwt === "maybe") {
                const cookie = getCookie(c, GLOBALS.ACCESS_COOKIE_NAME);

                if (!cookie) {
                    return `${userAgent}${xfor}`;
                }

                return `${userAgent}${xfor}${cookie}`;
            }

            if (hasJwt) {
                const { userId } = (
                    c as Context<{
                        Variables: { accessTokenPayload: QuizzyJWTPAYLOAD };
                    }>
                ).get("accessTokenPayload");

                return `${userAgent}${xfor}${userId}`;
            }

            return `${userAgent}${xfor}`;
        },
        message: message || "Too many requests, please try again later.",
    });
}
