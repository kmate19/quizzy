import GLOBALS from "@/config/globals";
import { QuizzyJWTPAYLOAD } from "@/types";
import { Context } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { getCookie } from "hono/cookie";
import { decode } from "hono/jwt";

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
            let key = "unknown";

            const userAgent =
                c.req.header("User-Agent") || "unknown-user-agent";

            const cfconnecting =
                c.req.header("CF-Connecting-IP") || "unknown-ip";

            key = `${userAgent};${cfconnecting}`;

            if (hasJwt === "maybe") {
                const cookie = getCookie(c, GLOBALS.ACCESS_COOKIE_NAME);

                if (!cookie) {
                    key = `noauth:${key}`;
                    console.log(key);
                    return key;
                }

                key = `hascookie:${key};${cookie.substring(0, 20)}`;
                console.log(key);
                return key;
            }

            if (hasJwt) {
                const { userId } = (
                    c as Context<{
                        Variables: { accessTokenPayload: QuizzyJWTPAYLOAD };
                    }>
                ).get("accessTokenPayload");

                key = `auth:${key};${userId}`;
                console.log(key);
                return key;
            }

            key = `noauth:${key}`;
            console.log(key);
            return key;
        },
        message: message || "Túl sok kérés érkezett, próbáld újra később.",
    });
}
