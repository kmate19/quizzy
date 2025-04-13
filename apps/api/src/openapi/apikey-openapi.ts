import { ApiResponseSchema } from "@/utils/schemas/zod-schemas";
import { postApiKeySchema } from "@/db/schemas";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";

export const createApiKeyDesc = describeRoute({
    tags: ["API Kulcsok"],
    description:
        "Új API kulcs létrehozása a hitelesített felhasználó számára. A kulcsot csak egyszer jeleníti meg, ezért biztonságosan kell tárolni. Felhasználói hitelesítést igényel.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: resolver(postApiKeySchema),
                },
            },
            description:
                "Az új API kulcs részletei, beleértve a nevét és a lejárati dátumot.",
            required: true,
        },
    },
    responses: {
        200: {
            description:
                "Sikeres - API kulcs létrehozva. A válasz tartalmazza a teljes kulcsot (biztonságosan tárolja).",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema), // Data contains the full string API key
                },
            },
        },
        400: {
            description:
                "Hibás kérés - Érvénytelen beviteli formátum (pl. érvénytelen dátum).",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        401: {
            description: "Nem jogosult - A felhasználó nincs bejelentkezve.",
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
                "Nem jogosult - A felhasználó nem rendelkezik admin jogosultsággal, vagy elérte a maximálisan engedélyezett aktív API kulcsok számát.",
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

export const listApiKeysDesc = describeRoute({
    tags: ["API Kulcsok"],
    description:
        "Listázza a hitelesített admin felhasználóhoz tartozó összes API kulcsot. A kulcsok visszaadva lesznek maskoltak (csak az első/utolsó néhány karakter látható). Admin jogosultság szükséges.",
    responses: {
        200: {
            description:
                "Sikeres - API kulcsok lekérdezve. A válasz tartalmazza a kulcs objektumok tömbjét (maskolt kulcs, leírás, létrehozási/lejárati dátumok, felhasználó-specifikus ID).",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema), // Data contains array of masked key objects
                },
            },
        },
        401: {
            description: "Nem jogosult - A felhasználó nincs bejelentkezve.",
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
                "Nem jogosult - A felhasználó nem rendelkezik admin jogosultsággal.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        404: {
            description:
                "Nem található - A felhasználónak nincs aktív API kulcsa.",
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

export const deleteApiKeyDesc = describeRoute({
    tags: ["API Kulcsok"],
    description:
        "Törli a megadott API kulcsot. A kulcs azonnal érvénytelen lesz. Felhasználói hitelesítést igényel.",
    request: {
        params: {
            type: "object",
            properties: {
                id: {
                    type: "string",
                    pattern: "^\\d+$",
                    description:
                        "The user-specific index (id_by_user) of the API key to delete.",
                    example: "0",
                },
            },
            required: ["id"],
        },
    },
    responses: {
        200: {
            description: "Sikeres - API kulcs törölve.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description:
                "Hibás kérés - Érvénytelen ID formátum (szám karakterlánc).",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        401: {
            description: "Nem jogosult - A felhasználó nincs bejelentkezve.",
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
                "Nem jogosult - A felhasználó nem rendelkezik admin jogosultsággal.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        404: {
            description:
                "Nem található - Nem található API kulcs a megadott felhasználó-specifikus indexhez.",
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
