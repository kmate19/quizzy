import GLOBALS from "@/config/globals.ts";
import db from "@/db/index.ts";
import { userApiKeys } from "@/db/schemas/userApiKeysSchema.ts";
import checkJwt from "@/middlewares/checkJwt.ts";
import { eq } from "drizzle-orm";

const listHandler = GLOBALS.CONTROLLER_FACTORY(checkJwt("admin"), async (c) => {
    const keys = await db.query.userApiKeys.findMany({
        where: eq(userApiKeys.user_id, c.get("accessTokenPayload").userId),
        columns: {
            user_id: false,
        },
    })

    if (keys.length === 0) {
        const res = {
            message: "No API keys found",
            error: {
                message: "No API keys found",
                case: "not_found"
            }
        }
        return c.json(res, 404);
    }

    // hide the full keys
    keys.map(key => key.key = key.key.substring(0, 3) + "..." + key.key.substring(key.key.length - 3, key.key.length));
    const res = {
        message: "API keys found",
        data: keys
    }
    return c.json(res);
})

export default listHandler;
