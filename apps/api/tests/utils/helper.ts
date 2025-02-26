import db from "@/db";
import { expect } from "bun:test";
import { usersTable } from "@/db/schemas";
import { eq } from "drizzle-orm";

export async function registerTestUser(
    client: any,
    user: { username: string; email: string; password: string } = {
        username: "mateka",
        email: "test",
        password: "123",
    },
    verifyEmail = false
) {
    user.email = user.email + "@example.com";
    const reg = await client.auth.register.$post({ json: user });
    expect(reg.status).toBe(200);

    // manually verify email
    if (verifyEmail) {
        await db
            .update(usersTable)
            .set({ auth_status: "active" })
            .where(eq(usersTable.email, "test@example.com"));
    }

    return reg;
}

export async function registerAndLogin(
    client: any,
    user: { username: string; email: string; password: string } = {
        username: "mateka",
        email: "tes",
        password: "123",
    }
) {
    user.email = user.email + "@example.com";
    console.log(user);
    const reg = await client.auth.register.$post({ json: user });
    console.log(await reg.json());
    expect(reg.status).toBe(200);

    await db
        .update(usersTable)
        .set({ auth_status: "active" })
        .where(eq(usersTable.email, user.email));

    const loginCreds = {
        username_or_email: user.email,
        password: user.password,
    };

    const login = await client.auth.login.$post({ json: loginCreds });

    expect(login.status).toBe(200);

    const cookies = login.headers.getSetCookie();

    return {
        reg,
        cookies,
    };
}
