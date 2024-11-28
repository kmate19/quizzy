import { Hono } from "hono";
import { add } from "@repo/connect";


const app = new Hono();

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

const port = 3001;
console.log(Bun.env.PATH);
console.log(`Server is running on http://localhost:${port}`);

console.log(add(6, 2));

export default {
    port: port,
    fetch: app.fetch
};
