import { Hono } from "hono";
import { add } from "@repo/connect";


const app = new Hono();

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

const port = 3001;
console.log(`Server is running on http://localhost:${port}`);

console.log(add(6, 2));

export default app;
