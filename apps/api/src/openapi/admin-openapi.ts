// ./src/openapi/admin-openapi.ts

import {
    ApiResponseSchema,
    paginationSchema,
} from "@/utils/schemas/zod-schemas";
import { authStatusEnum } from "@/db/schemas";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";

const uuidParam = {
    type: "object",
    properties: {
        quizId: {
            type: "string",
            format: "uuid",
            description: "A kvíz UUID azonosítója.",
        },
    },
    required: ["quizId"],
};

const apiKeySecurity = [{ ApiKeyAuth: [] }]; // Globálisan definiálható az OpenAPI beállításban, ha szükséges

export const setRoleDesc = describeRoute({
    tags: ["Adminisztráció"],
    security: apiKeySecurity,
    description:
        "Szerepkör hozzárendelése egy felhasználóhoz. Érvényes API kulcs szükséges az 'X-Api-Key' fejlécben.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        userId: z.string().uuid(),
                        roleName: z.string(),
                    }),
                },
            },
            description:
                "Felhasználó UUID és a hozzárendelendő szerepkör neve.",
            required: true,
        },
    },
    responses: {
        200: {
            description:
                "Sikeres - A szerepkör sikeresen hozzárendelve/frissítve.",
            content: {
                "application/json": { schema: resolver(ApiResponseSchema) },
            },
        },
        400: {
            description:
                "Hibás kérés - Érvénytelen bemeneti adatok, nem létező szerepkör név, vagy adatbázis konfliktus (pl. a felhasználó már rendelkezik a szerepkörrel).",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        401: {
            description: "Jogosulatlan - Hiányzó vagy érvénytelen API kulcs.",
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

export const setAuthStatusDesc = describeRoute({
    tags: ["Adminisztráció"],
    security: apiKeySecurity,
    description:
        "A felhasználó hitelesítési állapotának ('aktív', 'függőben', 'blokkolt') beállítása. Érvényes API kulcs szükséges.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        userId: z.string().uuid(),
                        status: z.enum(authStatusEnum.enumValues),
                    }),
                },
            },
            description: "Felhasználó UUID és az új hitelesítési állapot.",
            required: true,
        },
    },
    responses: {
        200: {
            description:
                "Sikeres - A felhasználó hitelesítési állapota frissítve.",
            content: {
                "application/json": { schema: resolver(ApiResponseSchema) },
            },
        },
        400: {
            description:
                "Hibás kérés - Érvénytelen bemeneti adatok vagy adatbázis hiba.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        401: {
            description: "Jogosulatlan - Hiányzó vagy érvénytelen API kulcs.",
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

export const setQuizStatusDesc = describeRoute({
    tags: ["Adminisztráció"],
    security: apiKeySecurity,
    description:
        "Kvíz jóváhagyása ('publikált') vagy elutasítása ('elutasított'), amely jelenleg 'ellenőrzésre_vár' állapotban van. Érvényes API kulcs szükséges.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        quizId: z.string().uuid(),
                        approve: z.enum(["published", "rejected"]),
                    }),
                },
            },
            description:
                "Kvíz UUID és az új állapot ('publikált' vagy 'elutasított').",
            required: true,
        },
    },
    responses: {
        200: {
            description: "Sikeres - A kvíz állapota frissítve.",
            content: {
                "application/json": { schema: resolver(ApiResponseSchema) },
            },
        },
        400: {
            description:
                "Hibás kérés - Érvénytelen bemeneti adatok, kvíz nem található, kvíz nem 'ellenőrzésre_vár' állapotban van, vagy adatbázis hiba.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        401: {
            description: "Jogosulatlan - Hiányzó vagy érvénytelen API kulcs.",
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

export const getAllQuizzesAdminDesc = describeRoute({
    tags: ["Adminisztráció"],
    security: apiKeySecurity,
    description:
        "Az összes kvíz lapozható listájának lekérése a rendszerben, függetlenül az állapottól. Beleérti a felhasználót, címkéket és nyelveket. Érvényes API kulcs szükséges.",
    request: {
        query: resolver(paginationSchema),
    },
    responses: {
        200: {
            description:
                "Sikeres - Az összes kvíz listája és a teljes darabszám.",
            content: {
                "application/json": { schema: resolver(ApiResponseSchema) },
            },
        },
        400: {
            description: "Hibás kérés - Érvénytelen lapozási paraméterek.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        401: {
            description: "Jogosulatlan - Hiányzó vagy érvénytelen API kulcs.",
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

export const getAllUsersAdminDesc = describeRoute({
    tags: ["Adminisztráció"],
    security: apiKeySecurity,
    description:
        "Az összes felhasználó lapozható listájának lekérése a rendszerben, beleértve a részletes információkat, mint statisztikák, tokenek, értékelések, API kulcsok és szerepkörök. Érvényes API kulcs szükséges.",
    request: {
        query: resolver(paginationSchema),
    },
    responses: {
        200: {
            description:
                "Sikeres - Az összes felhasználó listája és a teljes darabszám.",
            content: {
                "application/json": { schema: resolver(ApiResponseSchema) },
            },
        },
        400: {
            description: "Hibás kérés - Érvénytelen lapozási paraméterek.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        401: {
            description: "Jogosulatlan - Hiányzó vagy érvénytelen API kulcs.",
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

export const authenticateAdminDesc = describeRoute({
    tags: ["Adminisztráció"],
    security: apiKeySecurity,
    description:
        "Ellenőrzi, hogy az 'X-Api-Key' fejlécben megadott API kulcs érvényes-e és nem járt-e le.",
    responses: {
        200: {
            description: "Sikeres - Az API kulcs érvényes.",
            content: {
                "application/json": { schema: resolver(ApiResponseSchema) },
            },
        },
        401: {
            description:
                "Jogosulatlan - Hiányzó vagy érvénytelen/lejárt API kulcs.",
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

export const getQuizByIdAdminDesc = describeRoute({
    tags: ["Adminisztráció"],
    security: [{ ApiKeyAuth: [] }],
    description:
        "Egyetlen kvíz lekérése UUID alapján, függetlenül az állapottól. Beleérti a teljes részleteket, mint felhasználó, kártyák, címkék, nyelvek. Hitelesítést igényel API kulcs használatával.",
    request: {
        params: uuidParam,
    },
    responses: {
        200: {
            description: "Sikeres - A kért kvíz teljes részletei.",
            content: {
                "application/json": { schema: resolver(ApiResponseSchema) },
            },
        },
        401: {
            description:
                "Jogosulatlan - Hiányzó vagy érvénytelen API kulcs / JWT süti.",
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
                "Nem található - Nem található kvíz a megadott UUID-vel.",
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
