import GLOBALS from "@/config/globals.ts";
import db from "@/db/index.ts";
import { userApiKeys } from "@/db/schemas/userApiKeysSchema.ts";
import checkJwt from "@/middlewares/checkJwt.ts";
import { eq } from "drizzle-orm";

const listHandler = GLOBALS.CONTROLLER_FACTORY(checkJwt("admin"), async (c) => {
    try {
        const keys = await db.query.userApiKeys.findMany({
            where: eq(userApiKeys.user_id, c.get("accessTokenPayload").userId as string),
            columns: {
                user_id: false,
            },
        })
        if (!keys) {
            throw new Error("No keys found");
        }
        // hide the full key
        keys.map(key => key.key = key.key.substring(0, 3) + "..." + key.key.substring(key.key.length - 3, key.key.length));
        return c.json({ keys: keys });
    } catch (error) {
        c.status(500);
        return c.body('')
    }

})

export default listHandler;
