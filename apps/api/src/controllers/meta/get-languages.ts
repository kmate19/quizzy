import GLOBALS from "@/config/globals";
import db from "@/db";
import { languagesTable } from "@/db/schemas";
import { apikey_or_jwt } from "@/middlewares/check-composite";

const getLanguagesHandlers = GLOBALS.CONTROLLER_FACTORY(
    apikey_or_jwt(),
    async (c) => {
        const langs = await db
            .select({
                name: languagesTable.name,
                isoCode: languagesTable.iso_code,
                icon: languagesTable.icon,
                support: languagesTable.support,
            })
            .from(languagesTable);

        return c.json(langs, 200);
    }
);

export default getLanguagesHandlers;
