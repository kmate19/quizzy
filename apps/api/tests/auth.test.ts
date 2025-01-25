import { describe, test, expect, beforeEach } from "bun:test";
import { app } from "@/index";
import { testClient } from "hono/testing";
import { reset } from "drizzle-seed";
import db from "@/db";
import * as schema from "@/db/schemas/index";
import GLOBALS from "@/config/globals";

beforeEach(async () => {
    await reset(db, schema);
    for (let i = 0; i < GLOBALS.DB_ROLES.length; i++) {
        await db.insert(schema.rolesTable).values(GLOBALS.DB_ROLES[i]).onConflictDoNothing()
    }
});

const client = testClient(app).api.v1;

// TODO: check email somehow

describe("tests for api auth functionality", () => {
    describe("registration", () => {
        test("register success (email not checked)", async () => {
            const res = await client.auth.register.$post({
                json: {
                    username: "mateka", email: "kissmate019@gmail.com", password: "123456"
                }
            })

            const json = await res.json();
            console.error("json", json);
            expect(res.status).toBe(200);
            expect(json.message).toBe("user created");
        });
        test("fails cause bad data", async () => {
            const res = await client.auth.register.$post({
                json: {
                    username: "mateka", email: "kissmate01m", password: "123456"
                }
            })

            const json = await res.json() as unknown as { error: { name: string } };
            console.error("json", json);
            expect(res.status).toBe(400);
            expect(json.error.name).toBe("ZodError");
        });
        test("fails cause duplicate username/email error", async () => {
            await client.auth.register.$post({
                json: {
                    username: "mateka", email: "kissmate019@gmail.com", password: "123456"
                }
            })

            const res_email = await client.auth.register.$post({
                json: {
                    username: "mateka2", email: "kissmate019@gmail.com", password: "123456"
                }
            })

            if (!res_email.ok) {
                const json = await res_email.json();
                expect(res_email.status).toBe(400);
                expect(json.message).toBe("user not created");
                expect(json.error.message).toBe("email already exists");
            }

            const res_username = await client.auth.register.$post({
                json: {
                    username: "mateka", email: "kissmatee019@gmail.com", password: "123456"
                }
            })

            if (!res_username.ok) {
                const json = await res_username.json();
                expect(res_username.status).toBe(400);
                expect(json.message).toBe("user not created");
                expect(json.error.message).toBe("username already exists");
            }
        });
    });
});
