import { describe, test, expect, beforeEach } from "bun:test";
import { app } from "@/index";
import { testClient } from "hono/testing";
import { reset } from "drizzle-seed";
import db from "@/db";
import * as schema from "@/db/schemas/index";
import GLOBALS from "@/config/globals";
import { registerTestUser } from "./utils/helper";
import { eq } from "drizzle-orm";
import { verify } from "hono/jwt";
import ENV from "@/config/env";
import { QuizzyJWTPAYLOAD } from "@/types";

beforeEach(async () => {
    await reset(db, schema);
    for (let i = 0; i < GLOBALS.DB_ROLES.length; i++) {
        await db
            .insert(schema.rolesTable)
            .values(GLOBALS.DB_ROLES[i])
            .onConflictDoNothing();
    }
});

const client = testClient(app).api.v1;

// TODO: refactor (all tests)
describe("tests for api key functionality", () => {
    describe("create", () => {
        test("fails if user is not logged in", async () => {
            const res = await client.apikey.create.$post({
                json: { expires_at: `${Date.now() + 1000}` },
            });

            // have to ts ignore since middleware returns are not typed in rpc yet
            //@ts-ignore
            expect(res.status).toBe(401);
            const json = await res.json();
            expect(json.message).toBe("not logged in");
        });
        test("fails if user is not admin", async () => {
            await registerTestUser(client, undefined, true);

            const login = await client.auth.login.$post({
                json: {
                    username_or_email: "mateka",
                    password: "123",
                },
            });

            const cookie = login.headers.getSetCookie();

            const res = await client.apikey.create.$post(
                {
                    json: {
                        expires_at: `${Date.now() + 1000}`,
                    },
                },
                { headers: { Cookie: cookie.join(";") } }
            );

            expect(res.status).toBe(403);
            const json = await res.json();
            expect(json.message).toBe("user does not have the required role");
        });
        test("successfully create apikey given all the requirements and get it back", async () => {
            await registerTestUser(client, undefined, true);

            const login = await client.auth.login.$post({
                json: {
                    username_or_email: "mateka",
                    password: "123",
                },
            });

            const cookie = login.headers.getSetCookie();
            const jwt = (await verify(
                cookie.join(";").split("=")[1].split(";")[0],
                ENV.ACCESS_JWT_SECRET()
            )) as QuizzyJWTPAYLOAD;

            const [roleId] = await db
                .select({ id: schema.rolesTable.id })
                .from(schema.rolesTable)
                .where(eq(schema.rolesTable.name, "admin"));
            await db
                .update(schema.userRolesTable)
                .set({ role_id: roleId.id })
                .where(eq(schema.userRolesTable.user_id, jwt.userId));

            const res = await client.apikey.create.$post(
                {
                    json: {
                        expires_at: new Date().toISOString(),
                    },
                },
                { headers: { Cookie: cookie.join(";") } }
            );

            expect(res.status).toBe(200);
            // need the if for rpc type inference
            if (res.ok) {
                const json = await res.json();
                expect(json.message).toBe(
                    "API key created, you will only see the full key once, so save it"
                );
                expect(typeof json.data).toBe("string");
                expect(json.data.split("_")[1].length).toBe(32);
            }
        });
        test("successfully increment own apikey counts", async () => {
            await registerTestUser(client, undefined, true);

            const login = await client.auth.login.$post({
                json: {
                    username_or_email: "mateka",
                    password: "123",
                },
            });

            const cookie = login.headers.getSetCookie();
            const jwt = (await verify(
                cookie.join(";").split("=")[1].split(";")[0],
                ENV.ACCESS_JWT_SECRET()
            )) as QuizzyJWTPAYLOAD;

            const [roleId] = await db
                .select({ id: schema.rolesTable.id })
                .from(schema.rolesTable)
                .where(eq(schema.rolesTable.name, "admin"));
            await db
                .update(schema.userRolesTable)
                .set({ role_id: roleId.id })
                .where(eq(schema.userRolesTable.user_id, jwt.userId));

            const keyCount = 3;
            for (let i = 0; i < keyCount; i++) {
                await client.apikey.create.$post(
                    {
                        json: {
                            expires_at: new Date().toISOString(),
                        },
                    },
                    { headers: { Cookie: cookie.join(";") } }
                );
            }

            const keys = await db
                .select()
                .from(schema.userApiKeys)
                .where(eq(schema.userApiKeys.user_id, jwt.userId));

            expect(keys.length).toBe(3);
            // zero indexed
            expect(keys.at(-1)!.id_by_user).toBe(keyCount - 1);
        });
        test("fail if max limit of keys is reached", async () => {
            await registerTestUser(client, undefined, true);

            const login = await client.auth.login.$post({
                json: {
                    username_or_email: "mateka",
                    password: "123",
                },
            });

            const cookie = login.headers.getSetCookie();
            const jwt = (await verify(
                cookie.join(";").split("=")[1].split(";")[0],
                ENV.ACCESS_JWT_SECRET()
            )) as QuizzyJWTPAYLOAD;

            const [roleId] = await db
                .select({ id: schema.rolesTable.id })
                .from(schema.rolesTable)
                .where(eq(schema.rolesTable.name, "admin"));
            await db
                .update(schema.userRolesTable)
                .set({ role_id: roleId.id })
                .where(eq(schema.userRolesTable.user_id, jwt.userId));

            let latestRes;
            for (let i = 0; i < GLOBALS.MAX_ACTIVE_API_KEYS + 1; i++) {
                latestRes = await client.apikey.create.$post(
                    {
                        json: {
                            expires_at: new Date().toISOString(),
                        },
                    },
                    { headers: { Cookie: cookie.join(";") } }
                );
            }

            expect(latestRes!.status).toBe(403);
            const json = await latestRes!.json();
            expect(json.message).toBe(
                "You have reached the maximum number of API keys"
            );
        });
    });
    describe("list", () => {
        test("404 if no api keys present", async () => {
            await registerTestUser(client, undefined, true);

            const login = await client.auth.login.$post({
                json: {
                    username_or_email: "mateka",
                    password: "123",
                },
            });

            const cookie = login.headers.getSetCookie();
            const jwt = (await verify(
                cookie.join(";").split("=")[1].split(";")[0],
                ENV.ACCESS_JWT_SECRET()
            )) as QuizzyJWTPAYLOAD;

            const [roleId] = await db
                .select({ id: schema.rolesTable.id })
                .from(schema.rolesTable)
                .where(eq(schema.rolesTable.name, "admin"));
            await db
                .update(schema.userRolesTable)
                .set({ role_id: roleId.id })
                .where(eq(schema.userRolesTable.user_id, jwt.userId));

            const res = await client.apikey.list.$get(
                {},
                { headers: { Cookie: cookie.join(";") } }
            );

            expect(res.status).toBe(404);
            const json = await res.json();
            expect(json.message).toBe("No API keys found");
        });
    });
    test("lists masked api keys if they exist", async () => {
        await registerTestUser(client, undefined, true);

        const login = await client.auth.login.$post({
            json: {
                username_or_email: "mateka",
                password: "123",
            },
        });

        const cookie = login.headers.getSetCookie();
        const jwt = (await verify(
            cookie.join(";").split("=")[1].split(";")[0],
            ENV.ACCESS_JWT_SECRET()
        )) as QuizzyJWTPAYLOAD;

        const [roleId] = await db
            .select({ id: schema.rolesTable.id })
            .from(schema.rolesTable)
            .where(eq(schema.rolesTable.name, "admin"));
        await db
            .update(schema.userRolesTable)
            .set({ role_id: roleId.id })
            .where(eq(schema.userRolesTable.user_id, jwt.userId));

        const keyAmount = 5;

        for (let i = 0; i < keyAmount; i++) {
            await client.apikey.create.$post(
                {
                    json: {
                        expires_at: new Date().toISOString(),
                    },
                },
                { headers: { Cookie: cookie.join(";") } }
            );
        }

        const res = await client.apikey.list.$get(
            {},
            { headers: { Cookie: cookie.join(";") } }
        );

        expect(res.status).toBe(200);
        // need for rpc type inference
        if (res.ok) {
            const json = await res.json();
            expect(json.message).toBe("API keys found");
            const allAreMasked = json.data.every(
                (key) => key.key.includes("...") && typeof key.key === "string"
            );
            expect(json.data.length).toBe(keyAmount);
            expect(allAreMasked).toBe(true);
        }
    });
    describe("delete", () => {
        test("error if api key by index doesnt exist", async () => {
            await registerTestUser(client, undefined, true);

            const login = await client.auth.login.$post({
                json: {
                    username_or_email: "mateka",
                    password: "123",
                },
            });

            const cookie = login.headers.getSetCookie();
            const jwt = (await verify(
                cookie.join(";").split("=")[1].split(";")[0],
                ENV.ACCESS_JWT_SECRET()
            )) as QuizzyJWTPAYLOAD;

            const [roleId] = await db
                .select({ id: schema.rolesTable.id })
                .from(schema.rolesTable)
                .where(eq(schema.rolesTable.name, "admin"));
            await db
                .update(schema.userRolesTable)
                .set({ role_id: roleId.id })
                .where(eq(schema.userRolesTable.user_id, jwt.userId));

            const keyAmount = 2;

            for (let i = 0; i < keyAmount; i++) {
                await client.apikey.create.$post(
                    {
                        json: {
                            expires_at: new Date().toISOString(),
                        },
                    },
                    { headers: { Cookie: cookie.join(";") } }
                );
            }

            const res = await client.apikey.delete[":id"].$delete(
                { param: { id: "4" } },
                { headers: { Cookie: cookie.join(";") } }
            );

            expect(res.status).toBe(404);
            // need for rpc type inference
            const json = await res.json();
            expect(json.message).toBe("API key not found");
        });
        test("successfully delete api key", async () => {
            await registerTestUser(client, undefined, true);

            const login = await client.auth.login.$post({
                json: {
                    username_or_email: "mateka",
                    password: "123",
                },
            });

            const cookie = login.headers.getSetCookie();
            const jwt = (await verify(
                cookie.join(";").split("=")[1].split(";")[0],
                ENV.ACCESS_JWT_SECRET()
            )) as QuizzyJWTPAYLOAD;

            const [roleId] = await db
                .select({ id: schema.rolesTable.id })
                .from(schema.rolesTable)
                .where(eq(schema.rolesTable.name, "admin"));
            await db
                .update(schema.userRolesTable)
                .set({ role_id: roleId.id })
                .where(eq(schema.userRolesTable.user_id, jwt.userId));

            const keyAmount = 2;

            for (let i = 0; i < keyAmount; i++) {
                await client.apikey.create.$post(
                    {
                        json: {
                            expires_at: new Date().toISOString(),
                        },
                    },
                    { headers: { Cookie: cookie.join(";") } }
                );
            }

            const beforeDelete = await db
                .select()
                .from(schema.userApiKeys)
                .where(eq(schema.userApiKeys.user_id, jwt.userId));
            const res = await client.apikey.delete[":id"].$delete(
                { param: { id: "1" } },
                { headers: { Cookie: cookie.join(";") } }
            );
            const afterDelete = await db
                .select()
                .from(schema.userApiKeys)
                .where(eq(schema.userApiKeys.user_id, jwt.userId));

            // need for rpc type inference
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json.message).toBe("API key deleted");
            expect(beforeDelete.length).toBe(keyAmount);
            expect(afterDelete.length).toBe(keyAmount - 1);
            const correctIdDeleted = afterDelete.every(
                (key) => key.id_by_user !== 1
            );
            expect(correctIdDeleted).toBe(true);
        });
    });
});
