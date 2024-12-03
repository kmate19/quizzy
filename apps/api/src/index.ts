import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
    return c.text("Hello Hono!");
});

app.get('/test', async (c) => {
    return c.text('Test');
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

export default {
    port: port,
    fetch: app.fetch
};
