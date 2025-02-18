import { app } from "@/index";
import { beforeEach, describe, test, expect } from "bun:test";
import { testClient } from "hono/testing";
import { registerAndLogin } from "./utils/helper";
import { reset } from "drizzle-seed";
import db from "@/db";
import * as schema from "@/db/schemas/index";
import GLOBALS from "@/config/globals";
import { ApiResponse } from "repo";
import { and, eq } from "drizzle-orm";
import ENV from "@/config/env";
import { QuizzyJWTPAYLOAD } from "@/types";
import { sign, verify } from "hono/jwt";

const client = testClient(app).api.v1;

beforeEach(async () => {
    await reset(db, schema);
    for (let i = 0; i < GLOBALS.DB_ROLES.length; i++) {
        await db
            .insert(schema.rolesTable)
            .values(GLOBALS.DB_ROLES[i])
            .onConflictDoNothing();
    }
});

describe("tests for middleware", () => {
    describe("jwt middleware", () => {
        test("it fails if theres no cookie", async () => {
            await registerAndLogin(client);

            const res = await client.auth.authed.$get({ query: {} });

            const json = (await res.json()) as ApiResponse;
            expect(res.status).toBe(401);
            expect(json).toHaveProperty("error");
            expect(json?.error?.message).toBe("not logged in");
        });
        test("it is successful if everything is normal", async () => {
            const { cookies } = await registerAndLogin(client);

            const res = await client.auth.authed.$get(
                { query: {} },
                { headers: { cookie: cookies.join(";") } }
            );

            expect(res.status).toBe(200);
        });
        test("it fails if user doesnt have the required role", async () => {
            const { cookies } = await registerAndLogin(client);

            const res = await client.auth.authed.$get(
                { query: { role: "admin" } },
                { headers: { cookie: cookies.join(";") } }
            );

            const json = (await res.json()) as ApiResponse;
            expect(res.status).toBe(403);
            expect(json).toHaveProperty("error");
            expect(json?.error?.message).toBe(
                "user does not have the required role"
            );
        });
        test("it succeeds if user does have the required role", async () => {
            const { cookies } = await registerAndLogin(client);

            const [user] = await db
                .select()
                .from(schema.usersTable)
                .where(eq(schema.usersTable.username, "mateka"));
            const [adminRole] = await db
                .select()
                .from(schema.rolesTable)
                .where(eq(schema.rolesTable.name, "admin"));
            await db
                .insert(schema.userRolesTable)
                .values({ user_id: user.id, role_id: adminRole.id })
                .onConflictDoNothing();

            const res = await client.auth.authed.$get(
                { query: { role: "admin" } },
                { headers: { cookie: cookies.join(";") } }
            );

            expect(res.status).toBe(200);
        });
        test("it refreshes acccess token if expired", async () => {
            const { cookies } = await registerAndLogin(client);

            const jwt = cookies.join(";").split("=")[1].split(";")[0];

            // expire the jwt
            const decoded = (await verify(
                jwt,
                ENV.ACCESS_JWT_SECRET()
            )) as QuizzyJWTPAYLOAD;

            decoded.exp = Math.floor(Date.now() / 1000) - 10;

            const newJwt = await sign(decoded, ENV.ACCESS_JWT_SECRET());

            const cookiesModified = [
                `${GLOBALS.ACCESS_COOKIE_NAME}=${newJwt};`.concat(
                    cookies.join(";").split(";").slice(1).join(";")
                ),
            ];

            const res = await client.auth.authed.$get(
                { query: {} },
                { headers: { cookie: cookiesModified.join(";") } }
            );

            expect(res.status).toBe(200);
        });
        test("it fails if refresh token is expired", async () => {
            const { cookies } = await registerAndLogin(client);

            const [user] = await db
                .select()
                .from(schema.usersTable)
                .where(eq(schema.usersTable.username, "mateka"));
            const [userToken] = await db
                .select()
                .from(schema.userTokensTable)
                .where(
                    and(
                        eq(schema.userTokensTable.user_id, user.id),
                        eq(schema.userTokensTable.token_type, "refresh")
                    )
                );

            const jwt = cookies.join(";").split("=")[1].split(";")[0];

            // expire the jwt
            const decoded = (await verify(
                jwt,
                ENV.ACCESS_JWT_SECRET()
            )) as QuizzyJWTPAYLOAD;

            decoded.exp = Math.floor(Date.now() / 1000) - 10;

            const newJwt = await sign(decoded, ENV.ACCESS_JWT_SECRET());

            const cookiesModified = [
                `${GLOBALS.ACCESS_COOKIE_NAME}=${newJwt};`.concat(
                    cookies.join(";").split(";").slice(1).join(";")
                ),
            ];

            await db
                .update(schema.userTokensTable)
                .set({ expires_at: new Date() })
                .where(eq(schema.userTokensTable.id, userToken.id));

            const res = await client.auth.authed.$get(
                { query: {} },
                { headers: { cookie: cookiesModified.join(";") } }
            );

            const json = (await res.json()) as ApiResponse;
            expect(res.status).toBe(401);
            expect(json).toHaveProperty("error");
            expect(json?.error?.message).toBe("refresh token expired");
        });
        // NOTE: this is actually normal behaviour with jwt's as the access token is still valid, and in this small window
        // until the access token expires, the user can still access the api, but after that, the user will be logged out
        // if we really want to avoid this, transition to using sessions

        //test("edge case access token exists in cookies and still not expired but doesnt exist elsewhere anymore (nor the user)"
    });
});
