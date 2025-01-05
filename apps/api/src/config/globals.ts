import type { CookieOptions } from "hono/utils/cookie"
import ENV from "./env.ts"

const GLOBALS = {
    COOKIE_OPTS: {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        domain: ENV.DOMAIN(),
        maxAge: 60 * 60 * 24 * 30,
    } satisfies CookieOptions,
    ACCESS_COOKIE_NAME: "321vmnf",
    DB_ROLES: [{ name: "default", description: "Default user role." }, { name: "admin", description: "Basic admin role." }],
} as const;

export default GLOBALS;
