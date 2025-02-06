import db from "@/db";
import { expect } from 'bun:test'
import { usersTable } from "@/db/schemas";
import { eq } from "drizzle-orm";

export async function registerTestUser(
    client: any,
    user: { username: string, email: string, password: string }
        =
        { username: "mateka", email: "test@example.com", password: "123" },
    verifyEmail = false
) {
    const reg = await client.auth.register.$post({ json: user });
    expect(reg.status).toBe(200);

    // TODO: check actual email somehow

    // manually verify email
    if (verifyEmail) {
        await db.update(usersTable)
            .set({ auth_status: "active" })
            .where(eq(usersTable.email, "test@example.com"))
    }

    return reg;
}

export async function registerAndLogin(
    client: any,
    user: { username: string, email: string, password: string }
        =
        { username: "mateka", email: "test@example.com", password: "123" },
) {
    const reg = await client.auth.register.$post({ json: user });
    expect(reg.status).toBe(200);

    await db.update(usersTable)
        .set({ auth_status: "active" })
        .where(eq(usersTable.email, "test@example.com"))

    const loginCreds = { username_or_email: user.email, password: user.password };

    const login = await client.auth.login.$post({ json: loginCreds });

    expect(login.status).toBe(200);

    const cookies = login.headers.getSetCookie();

    return {
        reg,
        cookies
    };
}
