import type { CookieOptions } from "hono/utils/cookie"
import ENV from "./env"
import { createFactory } from "hono/factory";

const controllerFactory = createFactory().createHandlers;

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
    MAX_ACTIVE_API_KEYS: 10,
    CONTROLLER_FACTORY: controllerFactory,
    DB_ROLES: [{ name: "default", description: "Default user role." }, { name: "admin", description: "Basic admin role." }],
    WORKERCONF: {
        workerExtension: ENV.NODE_ENV() === "production" ? ".js" : ".ts",
        workerRelativePath: ENV.NODE_ENV() === "production" ? "./" : "../../"
    }
} as const;

export default GLOBALS;
