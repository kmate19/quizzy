import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from './schemas/index.ts';
import ENV from '@/config/env.ts';
import GLOBALS from '@/config/globals.ts';
import { reset, seed } from 'drizzle-seed';

const opts = ENV.NODE_ENV() === 'production' ? { schema } : { logger: true, schema };

const db = drizzle(ENV.DATABASE_URL(), opts);

if (ENV.NODE_ENV() === 'production') {
    await Bun.sleep(4000);
    await migrate(db, { migrationsFolder: './migrations' });
} else {
    await db.execute('SELECT 1');
    await reset(db, schema);
    // currently quizzes dont work since bytea is not supported
    const { quizzesTable, reviewsTable, quizLanguagesTable, quizTagsTable, quizCardsTable, ...rest } = schema;
    await seed(db, rest, { count: 100 });
}

for (let i = 0; i < GLOBALS.DB_ROLES.length; i++) {
    await db.insert(schema.rolesTable).values(GLOBALS.DB_ROLES[i]).onConflictDoNothing()
}


export default db;
