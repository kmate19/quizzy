import { serve } from "@hono/node-server";
import { add } from "@repo/connect";
import { Hono } from "hono";
const app = new Hono();
app.get("/", (c) => {
    return c.text("Hello Hono!");
});
const port = 3001;
console.log(`Server is running on http://localhost:${port}`);
console.log(add(1, 2));
serve({
    fetch: app.fetch,
    port,
});
