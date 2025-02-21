import type { CookieOptions } from "hono/utils/cookie";
import ENV from "./env";
import { createFactory } from "hono/factory";
import { Language, Role, Tag } from "@/db/schemas";

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
    DB_ROLES: [
        { name: "default", description: "Default user role." },
        { name: "admin", description: "Basic admin role." },
    ] satisfies Role[],
    DB_LANGUAGES: [
        { name: "Német", iso_code: "DE", icon: "🇩🇪", support: "partial" },
        { name: "Angol", iso_code: "EN", icon: "🇺🇸", support: "official" },
        { name: "Magyar", iso_code: "HU", icon: "🇭🇺", support: "official" },
    ] satisfies Language[],
    DB_TAGS: [
        { name: "Matematika" },
        { name: "Tudomány" },
        { name: "Technológia" },
        { name: "Mérnöktudomány" },
        { name: "Művészet" },
        { name: "Történelem" },
        { name: "Földrajz" },
        { name: "Irodalom" },
        { name: "Filozófia" },
        { name: "Pszichológia" },
        { name: "Egészség" },
        { name: "Orvostudomány" },
        { name: "Pénzügy" },
        { name: "Üzlet" },
        { name: "Oktatás" },
        { name: "Politika" },
        { name: "Jog" },
        { name: "Szociológia" },
        { name: "Környezetvédelem" },
        { name: "Sport" },
        { name: "Zene" },
        { name: "Filmek" },
        { name: "Játékok" },
        { name: "Programozás" },
        { name: "AI" },
        { name: "Kiberbiztonság" },
        { name: "Barkácsolás" },
        { name: "Ételek" },
        { name: "Utazás" },
        { name: "Divat" },
    ] satisfies Tag[],
    WORKERCONF: {
        workerExtension: ENV.NODE_ENV() === "production" ? ".js" : ".ts",
        workerRelativePath: ENV.NODE_ENV() === "production" ? "./" : "../../",
    },
} as const;

export default GLOBALS;
