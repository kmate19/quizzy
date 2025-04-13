// ./src/openapi/meta-openapi.ts

import { ApiResponseSchema } from "@/utils/schemas/zod-schemas";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";

export const getTagsDesc = describeRoute({
    tags: ["Metaadatok"],
    description:
        "Lekéri az összes elérhető címkét, amelyek kvízekhez társíthatók. Támogatja a JWT süti vagy API kulcs használatával történő hitelesítést.",
    responses: {
        200: {
            description:
                "Sikeres - Visszaadja a címke objektumok tömbjét, mindegyik tartalmazza a címke nevét.",
            content: {
                "application/json": {
                    // Schema likely Tag[] or ApiResponse with data: Tag[]
                    schema: resolver(ApiResponseSchema), // Assuming controller wraps in ApiResponse
                },
            },
        },
        // 401/403 might occur depending on apikey_or_jwt
    },
});

export const getLanguagesDesc = describeRoute({
    tags: ["Metaadatok"],
    description:
        "Lekéri az összes elérhető nyelvet, amelyekhez kvízek társíthatók, beleértve a nevüket, ISO kódjukat, ikonjukat és támogatási szintjüket. Támogatja a JWT süti vagy API kulcs használatával történő hitelesítést.",
    responses: {
        200: {
            description: "Sikeres - Visszaadja a nyelvi objektumok tömbjét.",
            content: {
                "application/json": {
                    // Schema likely Language[] or ApiResponse with data: Language[]
                    schema: resolver(ApiResponseSchema), // Assuming controller wraps in ApiResponse
                },
            },
        },
        // 401/403 might occur depending on apikey_or_jwt
    },
});
