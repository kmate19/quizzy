// ./src/openapi/quizzes-openapi.ts

import { resolver } from "hono-openapi/zod";
import { describeRoute } from "hono-openapi";
import {
    ApiResponseSchema,
    editQuizSchema,
    paginationSchema,
    publishQuizSchema,
    searchQuerySchema,
} from "@/utils/schemas/zod-schemas";

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

const userIdParam = {
    type: "object",
    properties: {
        userId: {
            type: "string",
            format: "uuid",
            description: "A felhasználó UUID azonosítója.",
        },
    },
    required: ["userId"],
};

export const publishQuizDesc = describeRoute({
    tags: ["Kvízek"],
    description:
        "Új kvíz publikálása, beleértve a részleteket (cím, leírás, állapot, banner kép), kártyákat (kérdések, válaszok, képek), társított nyelvi ISO kódokat és címke neveket. Felhasználói hitelesítést igényel.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: resolver(publishQuizSchema),
                },
            },
            description:
                "A teljes kvíz adatok, beleértve a kvíz információkat, kártyákat, nyelveket és címkéket. A képek base64 kódolással kell legyenek.",
            required: true,
        },
    },
    responses: {
        201: {
            description:
                "Sikeres - A kvíz sikeresen létrehozva. Visszaadja az új kvíz UUID azonosítóját.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description:
                "Hibás kérés - Érvénytelen adatok lettek megadva (pl. validációs hibák, helytelen képformátum/méret, nem létező nyelv/címke, túl sok kvíz/kártya).",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        401: {
            description: "Jogosulatlan - A felhasználó nincs bejelentkezve.",
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

export const editQuizDesc = describeRoute({
    tags: ["Kvízek"],
    description:
        "Egy meglévő, a hitelesített felhasználó által birtokolt kvíz szerkesztése. Lehetővé teszi a kvíz részletek, kártyák, nyelvek és címkék módosítását. Felhasználói hitelesítést igényel.",
    request: {
        params: uuidParam,
        body: {
            content: {
                "application/json": {
                    schema: resolver(editQuizSchema),
                },
            },
            description:
                "A frissítendő kvíz mezők. Csak a megadott mezők lesznek módosítva. A képek base64 kódolással kell legyenek.",
            required: true,
        },
    },
    responses: {
        200: {
            description:
                "Sikeres - A kvíz sikeresen frissítve. Visszaadja a kvíz UUID azonosítóját.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description:
                "Hibás kérés - Érvénytelen adatok lettek megadva (pl. validációs hibák, helytelen képformátum/méret, nem létező nyelv/címke, túl sok kártya, nincs változás észlelhető).",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        401: {
            description: "Jogosulatlan - A felhasználó nincs bejelentkezve.",
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
                "Nem található - A megadott kvíz nem található vagy nem a felhasználó tulajdona.",
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

export const getQuizzesDesc = describeRoute({
    tags: ["Kvízek"],
    description:
        "Nyilvánosan 'publikált' kvízek lapozható listájának lekérése, beleértve a társított felhasználót (csak felhasználónév), címkéket és nyelveket. Támogatja a JWT süti vagy API kulcs használatával történő hitelesítést.",
    request: {
        query: resolver(paginationSchema),
    },
    responses: {
        200: {
            description:
                "Sikeres - A publikált kvízek listája és a teljes darabszám.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description:
                "Hibás kérés - Érvénytelen lekérdezési paraméterek a lapozáshoz.",
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

export const getOwnQuizzesDesc = describeRoute({
    tags: ["Kvízek"],
    description:
        "Lekéri a hitelesített felhasználó által birtokolt összes kvízt, függetlenül az állapotuktól (vázlat, publikált, stb.), beleértve a társított címkéket és nyelveket. Felhasználói hitelesítést igényel.",
    responses: {
        200: {
            description:
                "Sikeres - A felhasználó által birtokolt összes kvíz listája.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        401: {
            description: "Jogosulatlan - A felhasználó nincs bejelentkezve.",
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

export const getQuizByIdDesc = describeRoute({
    tags: ["Kvízek"],
    description:
        "Egyetlen 'publikált' kvíz lekérése UUID alapján, beleértve a teljes részleteket: felhasználói információ (azonosító, felhasználónév, kép, állapot), kártyák, címkék és nyelvek. Támogatja a JWT süti vagy API kulcs használatával történő hitelesítést.",
    request: {
        params: uuidParam,
    },
    responses: {
        200: {
            description: "Sikeres - A kért publikált kvíz részletei.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        404: {
            description:
                "Nem található - A megadott UUID-val rendelkező kvíz nem található vagy nem 'publikált' állapotban van.",
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

export const getOwnQuizByIdDesc = describeRoute({
    tags: ["Kvízek"],
    description:
        "Egyetlen, a hitelesített felhasználó által birtokolt kvíz lekérése UUID alapján, függetlenül az állapottól, beleértve a teljes részleteket: kártyák, címkék és nyelvek. Felhasználói hitelesítést igényel.",
    request: {
        params: uuidParam,
    },
    responses: {
        200: {
            description:
                "Sikeres - A kért kvíz részletei, amelyek a felhasználó tulajdonát képezik.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        401: {
            description: "Jogosulatlan - A felhasználó nincs bejelentkezve.",
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
                "Nem található - A megadott UUID-val rendelkező kvíz nem található vagy nem a hitelesített felhasználó tulajdona.",
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

export const getQuizzesByUserIdDesc = describeRoute({
    tags: ["Kvízek"],
    description:
        "Egy adott felhasználó által létrehozott összes 'publikált' kvíz lekérése, azonosítva az UUID alapján. Beleérti a társított címkéket és nyelveket. Támogatja a JWT süti vagy API kulcs használatával történő hitelesítést.",
    request: {
        params: userIdParam,
    },
    responses: {
        200: {
            description:
                "Sikeres - A megadott felhasználó által létrehozott publikált kvízek listája.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        404: {
            description:
                "Nem található - A felhasználó nem található (bár a válasz lehet egy üres lista).",
        },
    },
});

export const deleteQuizDesc = describeRoute({
    tags: ["Kvízek"],
    description:
        "A hitelesített felhasználó által birtokolt kvíz törlése. Felhasználói hitelesítést igényel.",
    request: {
        params: uuidParam,
    },
    responses: {
        200: {
            description: "Sikeres - A kvíz sikeresen törölve.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        401: {
            description: "Jogosulatlan - A felhasználó nincs bejelentkezve.",
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
                "Nem található - A kvíz nem található vagy nem a felhasználó tulajdona.",
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

export const searchQuizzesDesc = describeRoute({
    tags: ["Kvízek"],
    description: `Keresés 'publikált' kvízek között szöveges lekérdezés (cím/leírás), címke nevek és nyelvi ISO kódok alapján. Támogatja a lapozást és a szigorú/nem szigorú egyezést a címkékhez/nyelvekhez.
    - A szöveges lekérdezés PostgreSQL \`ts_vector\` és \`plainto_tsquery\` használatával történik teljes szöveges kereséshez, plusz \`similarity\` trigram egyezéshez a cím alapján.
    - A címke/nyelv szűrők lehetnek egyetlen karakterláncok vagy tömbök.
    - 'strict=true': A kvíznek *minden* megadott címkével/nyelvvel kell rendelkeznie és *csak* azokkal a címkékkel/nyelvekkel.
    - 'strict=false' (alapértelmezett): A kvíznek *legalább egy* megadott címkével/nyelvvel kell rendelkeznie.
    - Ha több szűrő (lekérdezés, címkék, nyelvek) van megadva, a 'strict=true' minden feltétel egyezését igényli (ÉS), míg a 'strict=false' legalább egy feltétel egyezését igényli (VAGY).
    Támogatja a JWT süti vagy API kulcs használatával történő hitelesítést.`,
    request: {
        query: resolver(searchQuerySchema),
    },
    responses: {
        200: {
            description:
                "Sikeres - Visszaadja az egyező publikált kvízek listáját és a teljes darabszámot.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description:
                "Hibás kérés - Érvénytelen lekérdezési paraméterek (pl. lapozás formátuma).",
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
                "Nem található - A megadott címke név vagy nyelvi ISO kód nem létezik.",
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
