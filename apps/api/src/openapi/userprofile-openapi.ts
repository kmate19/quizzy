// ./src/openapi/userprofile-openapi.ts

import { ApiResponseSchema } from "@/utils/schemas/zod-schemas";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";

const userIdParam = {
    type: "object",
    properties: {
        userId: {
            type: "string",
            format: "uuid",
            description: "The UUID of the user.",
        },
    },
    required: ["userId"],
};

export const getUserProfileDesc = describeRoute({
    tags: ["Felhasználói Profil"],
    description:
        "Lekéri a hitelesített felhasználó profiljának részletes információit. Felhasználói hitelesítést igényel.",
    responses: {
        200: {
            description:
                "Sikeres - A felhasználó profiljának részletes információi.",
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

export const updateUserProfileDesc = describeRoute({
    tags: ["Felhasználói Profil"],
    description:
        "Frissíti a hitelesített felhasználó profiljának adatait. Felhasználói hitelesítést igényel.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({
                            username: z.string().min(1),
                            email: z.string().email(),
                            firstName: z.string().min(1),
                            lastName: z.string().min(1),
                        })
                    ),
                },
            },
            description: "A frissítendő profil adatok.",
            required: true,
        },
    },
    responses: {
        200: {
            description: "Sikeres - A felhasználó profilja frissítve.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description: "Hibás kérés - Érvénytelen profil adatok.",
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

export const updateUserPictureDesc = describeRoute({
    tags: ["Felhasználói Profil"],
    description:
        "Frissíti a hitelesített felhasználó profilképét. A képnek base64 kódolással kell lennie. Felhasználói hitelesítést igényel.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({
                            picture: z.string().min(1),
                        })
                    ),
                },
            },
            description: "Az új profilkép base64 kódolással.",
            required: true,
        },
    },
    responses: {
        200: {
            description: "Sikeres - A felhasználó profilképe frissítve.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description: "Hibás kérés - Érvénytelen kép formátum vagy méret.",
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

export const getUserProfileByIdDesc = describeRoute({
    tags: ["Felhasználói Profil"],
    description:
        "Lekéri a publikusan elérhető profil adatait egy adott felhasználónak a UUID alapján, beleértve a felhasználónevet, létrehozási dátumot, aktivitás állapotot, profilképet, statisztikákat és szerepköröket. Támogatja a JWT süti vagy API kulcs használatával történő hitelesítést.",
    request: {
        params: userIdParam,
    },
    responses: {
        200: {
            description:
                "Sikeres - Visszaadja a megadott felhasználó publikus profil adatait.",
            content: {
                "application/json": {
                    // Schema likely ApiResponse with data: User (subset of fields + relations)
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        404: {
            description:
                "Nem található - Nem található felhasználó a megadott UUID-vel.",
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
    },
});
