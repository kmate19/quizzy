import GLOBALS from "@/config/globals";
import db from "@/db";
import { tagsTable } from "@/db/schemas";
import { apikey_or_jwt } from "@/middlewares/check-composite";

const getTagsHandlers = GLOBALS.CONTROLLER_FACTORY(
    apikey_or_jwt(),
    async (c) => {
        const tags = await db.select({ name: tagsTable.name }).from(tagsTable);

        return c.json(tags, 200);
    }
);

export default getTagsHandlers;
