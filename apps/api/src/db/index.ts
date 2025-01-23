import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from './schemas/index';
import ENV from '@/config/env';
import GLOBALS from '@/config/globals';
import { reset, seed } from 'drizzle-seed';
import { getTableName } from 'drizzle-orm';

const opts = ENV.NODE_ENV() === 'production' ? { schema } : { logger: true, schema };

const db = drizzle(ENV.DATABASE_URL(), opts);

if (ENV.NODE_ENV() === 'production') {
    await Bun.sleep(4000);
    await migrate(db, { migrationsFolder: './migrations' });
} else {
    await db.execute('SELECT 1');
    // do this manually for now since this is annoying
    if (false) {
        await reset(db, schema);
        // currently quizzes dont work since bytea is not supported
        const { quizzesTable, reviewsTable, quizLanguagesTable, quizTagsTable, quizCardsTable, ...rest } = schema;
        await seed(db, rest, { count: 100 });
        // workaround for the sequence not being reset
        const tableKeys = Object.keys(rest).filter(key => key.endsWith('Table'));
        // @ts-ignore
        const tableNames = tableKeys.map(key => getTableName(rest[key]));

        tableNames.forEach(async (name) => {
            if (name === 'users') return;
            await db.execute(`SELECT setval('${name}_id_seq', (SELECT MAX(id) from ${name}))`);
        });
    }
}

for (let i = 0; i < GLOBALS.DB_ROLES.length; i++) {
    await db.insert(schema.rolesTable).values(GLOBALS.DB_ROLES[i]).onConflictDoNothing()
}


export default db;
