// ./src/openapi/events-openapi.ts

import {
    ApiResponseSchema,
    quizFinishedSchema,
} from "@/utils/schemas/zod-schemas";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";

export const quizFinishedDesc = describeRoute({
    tags: ["Események"],
    security: [{ BearerAuth: [] }], // Jelzi, hogy API kulcsot használ, talán globálisan definiálható? Vagy BearerAuth a WS titokhoz
    description: `Rögzíti egy felhasználó által befejezett kvíz eredményeit. Frissíti a kvíz játékok számát és a felhasználó statisztikáit (játékok, helyezések többjátékos módban, helyes/rossz válaszok).
    Hitelesítést igényel egy titkos token segítségével, amelyet az 'Authorization: Bearer <token>' fejlécben kell átadni (meg kell egyeznie a WS_SECRET környezeti változóval). Belső/szolgáltatások közötti használatra szánva.`,
    request: {
        body: {
            content: {
                "application/json": {
                    schema: resolver(quizFinishedSchema),
                },
            },
            description:
                "A befejezett kvíz részletei, beleértve a felhasználó azonosítóját, kvíz azonosítóját, típust (egyjátékos/többjátékos) és metaadatokat (helyezés, válaszok száma).",
            required: true,
        },
    },
    responses: {
        200: {
            description:
                "Sikeres - Az esemény feldolgozva és a statisztikák frissítve.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description:
                "Hibás kérés - Érvénytelen kérés törzs formátum vagy hiba az adatbázis rekordok frissítésekor.",
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
                "Jogosulatlan - Hiányzó vagy érvénytelen hitelesítési token (a Bearer token nem egyezik a WS_SECRET-tel).",
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
