import { describe, test, expect } from "bun:test";
import { app } from "@/index.ts";
import { testClient } from "hono/testing";

describe("reserving session", () => {
    test("fails if time difference is more than 1500 ms", async () => {
        const res = await testClient(app).reserve.session.$post({ query: { timestamp: (Date.now() - 2000).toString() } })
        expect(res.status).toBe(400);
    });
    test("successfully reserves a session and generates a code", async () => {
        const res = await testClient(app).reserve.session.$post({ query: { timestamp: Date.now().toString() } })
        expect(res.status).toBe(200);
        expect((await res.json()).code).toBeDefined();
    });
});
