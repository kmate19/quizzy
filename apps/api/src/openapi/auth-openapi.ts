// ./src/openapi/auth-openapi.ts

import { ApiResponseSchema } from "@/utils/schemas/zod-schemas";
import { LoginUserSchema, RegisterUserSchema } from "@/db/schemas";
import { changePasswordSchema } from "@/utils/schemas/zod-schemas";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";

export const registerDesc = describeRoute({
    tags: ["Hitelesítés"],
    description: "Új felhasználói fiók regisztrálása. Ellenőrző emailt küld.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: resolver(RegisterUserSchema),
                },
            },
            description: "Felhasználói regisztrációs adatok.",
            required: true,
        },
    },
    responses: {
        200: {
            description:
                "Sikeres - Felhasználó létrehozva, ellenőrző email elküldve.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description:
                "Hibás kérés - A felhasználó nem hozható létre érvényesítési hibák miatt (pl. érvénytelen email formátum, gyenge jelszó) vagy duplikált felhasználónév/email.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
    },
});

export const loginDesc = describeRoute({
    tags: ["Hitelesítés"],
    description:
        "Felhasználó bejelentkeztetése felhasználónév/email és jelszó használatával. Sikeres bejelentkezés esetén HTTP-only hozzáférési sütit állít be.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: resolver(LoginUserSchema),
                },
            },
            description: "Felhasználói bejelentkezési adatok.",
            required: true,
        },
    },
    responses: {
        200: {
            description:
                "Sikeres - Bejelentkezés sikeres, hozzáférési süti beállítva.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description:
                "Hibás kérés - A bejelentkezés sikertelen érvénytelen hitelesítő adatok miatt.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        401: {
            description:
                "Jogosulatlan - A fiók nincs ellenőrizve ('pending') vagy 'blocked' állapotban van.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
    },
});

export const logoutDesc = describeRoute({
    tags: ["Hitelesítés"],
    description:
        "Kijelentkezteti az aktuálisan bejelentkezett felhasználót a frissítési token érvénytelenítésével és a hozzáférési süti eltávolításával. Érvényes hozzáférési süti szükséges.",
    responses: {
        200: {
            description:
                "Sikeres - Felhasználó kijelentkezve, hozzáférési süti törölve.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        401: {
            description:
                "Jogosulatlan - A felhasználó nincs bejelentkezve (nincs érvényes hozzáférési süti).",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
    },
});

export const forgotPasswordDesc = describeRoute({
    tags: ["Hitelesítés"],
    description:
        "Jelszó visszaállító email kérése. Ha a megadott felhasználónév vagy email létezik, egy emailt küldünk, amely tartalmaz egy linket az ideiglenes jelszó aktiválásához.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: resolver(
                        LoginUserSchema.pick({ username_or_email: true })
                    ),
                },
            },
            description:
                "A jelszó visszaállításhoz használt felhasználónév vagy email.",
            required: true,
        },
    },
    responses: {
        200: {
            description:
                "Sikeres - Ha a fiók létezik, egy jelszó visszaállító emailt küldtünk. (A válasz ugyanaz, függetlenül attól, hogy a fiók létezik-e vagy sem, hogy megakadályozzuk a felhasználó enumerálást).",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description: "Hibás kérés - Érvénytelen bemeneti formátum.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
    },
});

export const changePasswordDesc = describeRoute({
    tags: ["Hitelesítés"],
    description:
        "A bejelentkezett felhasználó jelszavának megváltoztatása. Az aktuális (régi) jelszó és az új jelszó megadása szükséges. Érvényes hozzáférési süti szükséges.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: resolver(changePasswordSchema),
                },
            },
            description: "Régi és új jelszó adatok.",
            required: true,
        },
    },
    responses: {
        200: {
            description: "Sikeres - A jelszó sikeresen megváltoztatva.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        401: {
            description:
                "Jogosulatlan - Érvénytelen régi jelszó megadva vagy a felhasználó nincs bejelentkezve.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        400: {
            description:
                "Hibás kérés - Érvénytelen bemeneti formátum az új jelszóhoz.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
    },
});

export const forgotPassActivateDesc = describeRoute({
    tags: ["Hitelesítés"],
    description:
        "Az ideiglenes jelszó aktiválása az emailben küldött token segítségével. Ez megváltoztatja a felhasználó jelszavát az ideiglenesre.",
    request: {
        params: {
            type: "object",
            properties: {
                token: {
                    type: "string",
                    description: "A jelszó visszaállító token az emailből.",
                },
            },
            required: ["token"],
        },
    },
    responses: {
        200: {
            description:
                "Sikeres - Ideiglenes jelszó beállítva. A felhasználónak most be kell jelentkeznie az ideiglenes jelszóval és meg kell változtatnia azt.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description:
                "Hibás kérés - A megadott token érvénytelen vagy lejárt.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
    },
});

export const verifyDesc = describeRoute({
    tags: ["Hitelesítés"],
    description:
        "A felhasználó fiókjának ellenőrzése a regisztráció során emailben küldött ellenőrző token segítségével. A felhasználó állapotát 'aktív' állapotba állítja.",
    request: {
        params: {
            type: "object",
            properties: {
                emailHash: {
                    type: "string",
                    description: "Az email ellenőrző token az emailből.",
                },
            },
            required: ["emailHash"],
        },
    },
    responses: {
        200: {
            description: "Sikeres - A felhasználói fiók sikeresen ellenőrizve.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description:
                "Hibás kérés - A megadott ellenőrző token érvénytelen vagy lejárt.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
    },
});

export const authedDesc = describeRoute({
    tags: ["Hitelesítés"],
    description:
        "Ellenőrzi, hogy a felhasználó jelenleg be van-e jelentkezve a hozzáférési süti segítségével. Opcionálisan ellenőrizheti, hogy a felhasználó rendelkezik-e egy adott szerepkörrel.",
    request: {
        query: {
            type: "object",
            properties: {
                role: {
                    type: "string",
                    description:
                        "Opcionális szerepkör neve, amellyel ellenőrizhető, hogy a felhasználó rendelkezik-e vele.",
                    example: "admin",
                },
            },
        },
    },
    responses: {
        200: {
            description:
                "Sikeres - A felhasználó be van jelentkezve (és rendelkezik a megadott szerepkörrel, ha meg van adva).",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        401: {
            description:
                "Jogosulatlan - A felhasználó nincs bejelentkezve (nincs érvényes hozzáférési süti vagy lejárt token).",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        403: {
            description:
                "Tiltott - A felhasználó be van jelentkezve, de nem rendelkezik a lekérdezési paraméterben megadott szükséges szerepkörrel.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
    },
});
