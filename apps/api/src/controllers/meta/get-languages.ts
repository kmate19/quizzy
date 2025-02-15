import GLOBALS from "@/config/globals";
import db from "@/db";
import { languagesTable } from "@/db/schemas";


const getLanguagesHandlers = GLOBALS.CONTROLLER_FACTORY(async (c) => {
    const langs = await db.select({
        name: languagesTable.name,
        isoCode: languagesTable.iso_code,
        icon: languagesTable.icon,
        support: languagesTable.support,
    }).from(languagesTable)

    return c.json(langs, 200)
})

export default getLanguagesHandlers;
