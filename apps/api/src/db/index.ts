import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from './schemas/index.ts';
import ENV from '@/config/env.ts';

const opts = Bun.env.NODE_ENV === 'production' ? { schema } : { logger: true, schema };

const db = drizzle(ENV.DATABASE_URL(), opts);

if (Bun.env.NODE_ENV === 'production') {
    await Bun.sleep(4000);
    await migrate(db, { migrationsFolder: './migrations' });
} else {
    await db.execute('SELECT 1');
}

export default db;
