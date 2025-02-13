import db from "@/db"
import { userApiKeys } from "@/db/schemas"
import { eq } from "drizzle-orm"
import { createMiddleware } from "hono/factory"

const check_apikey = createMiddleware(async (c, next) => {
    const apikey = c.req.header("X-Api-Key")
    if (!apikey) {
        return c.json({ message: "" }, 401)
    }

    const dbApikey = await db.query.userApiKeys.findFirst({
        where: eq(userApiKeys.key, apikey),
    })

    if (!dbApikey || dbApikey.expires_at < new Date()) {
        return c.json({ message: "Invalid API key" }, 401)
    }

    await next()
})

export default check_apikey
