import { describe, test, expect, beforeAll } from "bun:test";
import { app } from "@/index";
import { testClient } from "hono/testing";


beforeAll(async () => {
})

const client = testClient(app).api.v1;

describe("tests for api auth functionality", () => {
    describe("registration", () => {
        test("register success (email not checked)", async () => {
            const res = await client.auth.register.$post({
                json: {
                    username: "mateka", email: "kuglof", password: "123456"
                }
            })

            expect(res.status).toBe(200);
            expect((await res.json()).message).toBe("user created");
        });
    });
});
