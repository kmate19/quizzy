import GLOBALS from "@/config/globals";
import db from "@/db/index";
import { userApiKeys } from "@/db/schemas/userApiKeysSchema";
import checkJwt from "@/middlewares/checkJwt";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import type { ApiResponse } from "repo";
import { z } from "zod";

const deleteHandler = GLOBALS.CONTROLLER_FACTORY(checkJwt("admin"), zValidator("param", z.object({ id: z.string().regex(/^\d+$/).transform(Number) })), async (c) => {
    await db.delete(userApiKeys).where(and(eq(userApiKeys.user_id, c.get("accessTokenPayload").userId), eq(userApiKeys.id, c.req.valid("param").id)));

    const res = {
        message: "API key deleted"
    } satisfies ApiResponse;
    return c.json(res, 200);
});

export default deleteHandler;
