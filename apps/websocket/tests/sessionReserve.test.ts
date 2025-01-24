import { describe, test, expect } from "bun:test";
import { app } from "@/index";
import { testClient } from "hono/testing";

describe("reserving session", () => {
    test("fails if time difference is more than 1500 ms", async () => {
        const res = await testClient(app).reserve.session[":code?"].$post({ param: { code: "" }, query: { ts: (Date.now() - 2000).toString() } })
        expect(res.status).toBe(400);
    });
    test("successfully reserves a session and generates a code", async () => {
        const res = await testClient(app).reserve.session[":code?"].$post({ param: { code: "" }, query: { ts: Date.now().toString() } })
        expect(res.status).toBe(200);
        expect((await res.json()).code).toBeDefined();
    });
    describe("if code is included in param", () => {
        test("fails if theres no session with that code", async () => {
            const res = await testClient(app).reserve.session[":code?"].$post({ param: { code: "random123" }, query: { ts: (Date.now()).toString() } })
            expect(res.status).toBe(400);
        });
        test("success if theres session with that code", async () => {
            const createRes = await testClient(app).reserve.session[":code?"].$post({ param: { code: "" }, query: { ts: (Date.now()).toString() } })
            const code = (await createRes.json()).code
            expect(code).toBeDefined();
            const res = await testClient(app).reserve.session[":code?"].$post({ param: { code }, query: { ts: (Date.now()).toString() } })
            expect(res.status).toBe(200);
            expect((await res.json()).code).toBe(code);
        });
    });
});
