import { drizzle } from "drizzle-orm/node-postgres";
import { pushSchema } from "drizzle-kit/api";
import * as schema from "./schemas/index";
import ENV from "@/config/env";
import GLOBALS from "@/config/globals";

const opts =
    ENV.NODE_ENV() === "production" ? { schema } : { logger: true, schema };

const db = drizzle(ENV.DATABASE_URL(), opts);

if (ENV.NODE_ENV() === "production") {
    await Bun.sleep(4000);
    // @ts-expect-error undocumented api
    await pushSchema({ schema }, db);
    // @ts-expect-error undocumented api
    await pushSchema({ schema }, db);
    // @ts-expect-error undocumented api
    await pushSchema({ schema }, db);
} else {
    await db.execute("SELECT 1");
}

await db.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm");
await db.execute("CREATE EXTENSION IF NOT EXISTS unaccent");

for (const role of GLOBALS.DB_ROLES) {
    await db.insert(schema.rolesTable).values(role).onConflictDoNothing();
}
for (const lang of GLOBALS.DB_LANGUAGES) {
    await db.insert(schema.languagesTable).values(lang).onConflictDoNothing();
}
for (const tag of GLOBALS.DB_TAGS) {
    await db.insert(schema.tagsTable).values(tag).onConflictDoNothing();
}

export default db;
