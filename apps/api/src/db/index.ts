import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from './schemas/index.ts';

const url = Bun.env.NODE_ENV === 'production'
    ? Bun.env.DATABASE_URL
    : "postgres://postgres:mypassword@localhost:5432/postgres";

const opts = Bun.env.NODE_ENV === 'production' ? { schema } : { logger: true, schema };

const db = drizzle(url!, opts);

if (Bun.env.NODE_ENV === 'production') {
    await Bun.sleep(2000);
    await migrate(db, { migrationsFolder: './migrations' });
} else {
    await db.execute('SELECT 1');
}

export default db;
