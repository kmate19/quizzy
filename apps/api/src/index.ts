import { Hono } from "hono";
import auth from "./routes/auth.ts";

const app = new Hono().basePath("/api/v1");

app.get("/", async (c) => {
    return c.text("Hello Hono!");
});

app.route('/', auth)

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

export default {
    port: port,
    fetch: app.fetch
};
