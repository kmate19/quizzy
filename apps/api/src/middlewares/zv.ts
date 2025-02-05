import { ZodSchema } from "zod";
import type { ValidationTargets } from "hono";
import { zValidator } from "@hono/zod-validator";
import ENV from "@/config/env";
import { ApiResponse } from "repo";


/**
 * Wrapper for zValidator so we can customize the response,
 * so we don't send out what our api is validating in production
 */
export const zv = <T extends ZodSchema, Target extends keyof ValidationTargets>(
    target: Target,
    schema: T
) => zValidator(target, schema, (result, c) => {
    if (ENV.NODE_ENV() === "development") {
        if (!result.success) {
            return c.json(result, 400);
        }
    } else {
        if (!result.success) {
            return c.json({ message: "Validation failed" } satisfies ApiResponse, 400);
        }
    };
});
