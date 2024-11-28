import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

const opts = process.env.NODE_ENV === 'production' ? {} : { logger: true };

const db = drizzle(process.env.DATABASE_URL!, opts);

export default db;
