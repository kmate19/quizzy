import { describe, test, expect, beforeEach } from "bun:test";
import { app } from "@/index";
import { testClient } from "hono/testing";
import { reset } from "drizzle-seed";
import db from "@/db";
import * as schema from "@/db/schemas/index";
import GLOBALS from "@/config/globals";
import { eq } from "drizzle-orm";
import { registerTestUser } from "./utils/helper";

// PERF: optimize cause this is goofy

beforeEach(async () => {
    await reset(db, schema);
    for (let i = 0; i < GLOBALS.DB_ROLES.length; i++) {
        await db.insert(schema.rolesTable).values(GLOBALS.DB_ROLES[i]).onConflictDoNothing()
    }
});

const client = testClient(app).api.v1;

// TODO: check email somehow

describe("tests for api auth functionality", () => {
    describe("verify", () => {
        test("successful verification", async () => {
            await registerTestUser(client, undefined, true);

            const emailToken = await db.query.usersTable.findFirst({
                columns: {},
                where: eq(schema.usersTable.email, "test@example.com"),
                with: {
                    tokens: {
                        where: eq(schema.userTokensTable.token_type, "email"),
                        columns: { token: true }
                    }
                }
            })

            const res = await client.auth.verify[":emailHash"].$get({ param: { emailHash: emailToken!.tokens[0].token } });

            expect(res.status).toBe(200);

            const [userVerifiedStatus] = await db.select({ verifyStatus: schema.usersTable.auth_status })
                .from(schema.usersTable).where(eq(schema.usersTable.email, "test@example.com"));

            expect(userVerifiedStatus.verifyStatus).toBe("active");
        });
    });
    describe("login", () => {
        // TODO: make this more foolproof even if 
        // the user doesnt supply the cookie in the header, currently its 500 error
        test("fails if already logged in (cookie check)", async () => {
            await registerTestUser(client, undefined, true);

            const resUsername = await client.auth.login.$post({
                json: {
                    username_or_email: "mateka", password: "123"
                }
            });
            const jsonUsername = await resUsername.json();
            expect(resUsername.status).toBe(200);
            expect(jsonUsername.message).toBe("login successful");

            const cookies = resUsername.headers.getSetCookie();

            const anotherLogin = await client.auth.login.$post({
                json: {
                    username_or_email: "test@example.com", password: "123"
                }
            }, { headers: { Cookie: cookies.join(';') } });

            const jsonAnotherLogin = await anotherLogin.json();
            expect(anotherLogin.status).toBe(400);
            expect(jsonAnotherLogin.message).toBe("user already has a login cookie");
        });
        test("fails if banned", async () => {
            await registerTestUser(client, undefined, false);

            await db.update(schema.usersTable)
                .set({ auth_status: "blocked" })
                .where(eq(schema.usersTable.email, "test@example.com"))

            const res_username = await client.auth.login.$post({
                json: {
                    username_or_email: "mateka", password: "123"
                }
            });
            const json_username = await res_username.json();
            expect(res_username.status).toBe(401);
            expect(json_username.message).toBe("Your account can't be accessed at this time. Please contant an administrator.");
        });
        test("fails if not verified", async () => {
            await registerTestUser(client, undefined, false);

            const res_username = await client.auth.login.$post({
                json: {
                    username_or_email: "mateka", password: "123"
                }
            });
            const json_username = await res_username.json();
            expect(res_username.status).toBe(401);
            expect(json_username.message).toBe("Account not verified! Please check your inbox for the verification email!");
        });
        test("fails when invalid password", async () => {
            await registerTestUser(client, undefined, true);

            const res_username = await client.auth.login.$post({
                json: {
                    username_or_email: "mateka", password: "1234"
                }
            });
            const json_username = await res_username.json();
            expect(res_username.status).toBe(401);
            expect(json_username.message).toBe("invalid password");
        });
        test("get cookie with successful login", async () => {
            await registerTestUser(client, undefined, true);

            const res_username = await client.auth.login.$post({
                json: {
                    username_or_email: "mateka", password: "123"
                }
            });
            const json_username = await res_username.json();
            expect(res_username.status).toBe(200);
            expect(json_username.message).toBe("login successful");

            const cookies = res_username.headers.getSetCookie();
            expect(cookies).toHaveLength(1);
        });
        test("login success with email and username both, also tests logout", async () => {
            await registerTestUser(client, undefined, true);

            const res_username = await client.auth.login.$post({
                json: {
                    username_or_email: "mateka", password: "123"
                }
            });
            const json_username = await res_username.json();
            expect(res_username.status).toBe(200);
            expect(json_username.message).toBe("login successful");

            const cookies = res_username.headers.getSetCookie();

            const logout = await client.auth.logout.$get({}, { headers: { Cookie: cookies.join(';') } });
            expect(logout.status).toBe(200);

            const res_email = await client.auth.login.$post({
                json: {
                    username_or_email: "test@example.com", password: "123"
                }
            },);
            const json_email = await res_email.json();
            expect(res_email.status).toBe(200);
            expect(json_email.message).toBe("login successful");
        });
    });
    describe("registration", () => {
        test("register success (email not checked)", async () => {
            const res = await registerTestUser(client, undefined, false);

            const json = await res.json();
            console.error("json", json);
            expect(res.status).toBe(200);
            expect(json.message).toBe("user created");
        });
        test("fails cause bad data", async () => {
            const res = await client.auth.register.$post({ json: { email: "invalid", username: "mateka", password: "com" } });

            const json = await res.json() as unknown as { error: { name: string } };
            console.error("json", json);
            expect(res.status).toBe(400);
            expect(json.error.name).toBe("ZodError");
        });
        test("fails cause duplicate username/email error", async () => {
            await registerTestUser(client, undefined, false);

            const res_email = await client.auth.register.$post({
                json: {
                    username: "mateka2", email: "test@example.com", password: "123456"
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
                    username: "mateka", email: "test2@example.com", password: "123456"
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
