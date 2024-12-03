import { Hono } from "hono";
import db from "./db/index.ts";
import { usersTable, type User } from "./db/schemas/usersSchema.ts";
import { eq } from "drizzle-orm";


const app = new Hono();

app.get("/", async (c) => {
    return c.text("Hello Hono!");
});

const testUser: User = {
    username: "hono",
    email: "hono@test.com",
    password: "password",
};

app.get('/test', async (c) => {
    await db.insert(usersTable).values(testUser);
    await db.update(usersTable).set({ username: 'hono' }).where(eq(usersTable.username, 'Test'));
    return c.text('Test');
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

export default {
    port: port,
    fetch: app.fetch
};
