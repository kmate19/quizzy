import { describe, test, expect } from "bun:test";
import app from "@/index.ts";

describe("example", () => {
    test("test", async () => {
        const req = new Request("http://localhost:3000/test");
        const res = await app.fetch(req);
        expect(res.status).toBe(200);
        expect(await res.text()).toBe("Test");
    });
});
