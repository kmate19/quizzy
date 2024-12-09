import { Hono } from "hono";
import auth from "./routes/auth.ts";
import checkJwt from "./middlewares/checkJwt.ts";

const app = new Hono().basePath("/api/v1");

app.route('/', auth)

app.use(checkJwt)

app.get("/protected", async (c) => {
    return c.text("You are authorized!");
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

export default {
    port: port,
    fetch: app.fetch
};
