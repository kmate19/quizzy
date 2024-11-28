import { defineConfig } from 'drizzle-kit';

//const url = process.env.NODE_ENV === 'production'
//    ? process.env.DATABASE_URL
//    : "postgres://postgres:mypassword@localhost:5432/postgres";

export default defineConfig({
    out: './migrations',
    schema: './src/db/schemas/*.ts',
    dialect: 'postgresql',
    //dbCredentials: {
    //    url: url!,
    //},
});

