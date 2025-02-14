import { app } from '@/index';
import { beforeEach, describe, test, expect } from 'bun:test'
import { testClient } from 'hono/testing';
import { registerAndLogin } from './utils/helper';
import { reset } from 'drizzle-seed';
import db from '@/db';
import * as schema from "@/db/schemas/index";
import GLOBALS from '@/config/globals';
import { ApiResponse } from 'repo';

const client = testClient(app).api.v1;

beforeEach(async () => {
    await reset(db, schema);
    for (let i = 0; i < GLOBALS.DB_ROLES.length; i++) {
        await db.insert(schema.rolesTable).values(GLOBALS.DB_ROLES[i]).onConflictDoNothing()
    }
})

describe("tests for middleware", () => {
    describe("jwt middleware", () => {
        test("it fails if theres no cookie", async () => {
            await registerAndLogin(client);

            const res = await client.auth.authed.$get({ query: {}, });

            const json = await res.json() as ApiResponse;
            expect(res.status).toBe(401);
            expect(json).toHaveProperty('error');
            expect(json?.error?.message).toBe("not logged in");
        });
        test.todo("it is successful if everything is normal", async () => {
        });
        test.todo("it fails if user doesnt have the required role", async () => {
        });
        test.todo("it succeeds if user does have the required role", async () => {
        });
        test.todo("it refreshes acccess token if expired", async () => {
        });
        test.todo("it fails if refresh token is expired", async () => {
        });
        // TODO:
        test.todo("edge case access token exists in cookies and still not expired but doesnt exist elsewhere anymore (nor the user)", async () => {
            const { cookies } = await registerAndLogin(client);

            await reset(db, schema);

            const res = await client.auth.authed.$get({ query: {} }, { headers: { cookie: cookies.join(';') } });

            const json = await res.json() as ApiResponse;
            expect(res.status).toBe(401);
            expect(json).toHaveProperty('error');
            expect(json?.error?.message).toBe("stale cookie");
        });
    });
});
