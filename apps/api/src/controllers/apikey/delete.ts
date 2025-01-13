import GLOBALS from "@/config/globals.ts";
import db from "@/db/index.ts";
import { userApiKeys } from "@/db/schemas/userApiKeysSchema.ts";
import checkJwt from "@/middlewares/checkJwt.ts";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const deleteHandler = GLOBALS.CONTROLLER_FACTORY(checkJwt("admin"), zValidator("param", z.object({ id: z.string().regex(/^\d+$/).transform(Number) })), async (c) => {
    await db.delete(userApiKeys).where(and(eq(userApiKeys.user_id, c.get("accessTokenPayload").userId), eq(userApiKeys.id, c.req.valid("param").id)));

    const res = {
        message: "API key deleted"
    }
    return c.json(res, 200);
});

export default deleteHandler;
