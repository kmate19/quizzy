import { Hono } from "hono";
import { add } from "@repo/connect";
import db from "./db/index.ts";
import { usersTable } from "./db/schemas/schema.ts";

const app = new Hono();

app.get("/", async (c) => {
    await db.insert(usersTable).values({ name: "John", age: 25, email: "asd" })
    return c.text("Hello Hono!");
});

add(8, 2)

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

export default {
    port: port,
    fetch: app.fetch
};
