
import GLOBALS from "@/config/globals";
import db from "@/db";
import { tagsTable } from "@/db/schemas";


const getTagsHandlers = GLOBALS.CONTROLLER_FACTORY(async (c) => {
    const tags = await db.select({ name: tagsTable.name }).from(tagsTable)

    return c.json(tags, 200)
})

export default getTagsHandlers;
