
import GLOBALS from "@/config/globals";
import db from "@/db";
import { tagsTable } from "@/db/schemas";
import checkJwt from "@/middlewares/check-jwt";


const getTagsHandlers = GLOBALS.CONTROLLER_FACTORY(checkJwt(), async (c) => {
    const tags = await db.select({ name: tagsTable.name }).from(tagsTable)

    return c.json(tags, 200)
})

export default getTagsHandlers;
