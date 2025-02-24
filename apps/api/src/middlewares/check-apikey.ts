import db from "@/db";
import { userApiKeys } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";

const check_apikey = createMiddleware<{
    Variables: { userIdForApiKey: string };
}>(async (c, next) => {
    const apikey = c.req.header("X-Api-Key");
    console.log(".DSDSDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD"+apikey)

    if (!apikey) {
        return c.json({ message: "" }, 401);
    }

    const dbApikey = await db.query.userApiKeys.findFirst({
        where: eq(userApiKeys.key, apikey),
    });

    if (!dbApikey || dbApikey.expires_at < new Date()) {
        return c.json({ message: "Invalid API key" }, 401);
    }

    console.log(
        `Api key usage:\nAPI key: ${apikey}\nUser ID: ${dbApikey.user_id}\nPath: ${c.req.path}`
    );

    c.set("userIdForApiKey", dbApikey.user_id);

    if (!next) {
        return;
    }
    await next();
});

export default check_apikey;
