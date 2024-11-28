import { Hono } from "hono";
import { add } from "@repo/connect";

const app = new Hono();

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

add(1, 2)

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

export default {
    port: port,
    fetch: app.fetch
};
