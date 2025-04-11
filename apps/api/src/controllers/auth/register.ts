import GLOBALS from "@/config/globals";
import db from "@/db/index";
import { rolesTable } from "@/db/schemas/rolesSchema";
import { userRolesTable } from "@/db/schemas/userRolesSchema";
import { RegisterUserSchema, usersTable } from "@/db/schemas/usersSchema";
import { userTokensTable } from "@/db/schemas/userTokensSchema";
import postgresErrorHandler from "@/utils/db/postgres-error-handler";
import type { ApiResponse } from "repo";
import { eq, or } from "drizzle-orm";
import { zv } from "@/middlewares/zv";
import { userStatsTable } from "@/db/schemas";
import { randomBytes } from "node:crypto";
import sendEmail from "@/utils/email/send-email";
import { makeRateLimiter } from "@/middlewares/ratelimiters";

const registerHandler = GLOBALS.CONTROLLER_FACTORY(
    // makemsg hungarian
    makeRateLimiter(15, 5, false, undefined, true),
    zv("json", RegisterUserSchema),
    async (c) => {
        const registerUserData = c.req.valid("json");

        const [user] = await db
            .select()
            .from(usersTable)
            .where(
                or(
                    eq(usersTable.email, registerUserData.email),
                    eq(usersTable.username, registerUserData.username)
                )
            );

        if (user) {
            const message =
                user.email === registerUserData.email
                    ? "email already exists"
                    : "username already exists";
            const res = {
                message: "user not created",
                error: {
                    message: message,
                    case: "auth",
                },
            } satisfies ApiResponse;
            return c.json(res, 400);
        }

        // PERF: maybe use worker threads
        registerUserData.password = await Bun.password.hash(
            registerUserData.password
        );

        let insertResult: { id: string } | undefined;
        const maybeError = await db
            .transaction(async (tx) => {
                [insertResult] = await tx
                    .insert(usersTable)
                    .values(registerUserData)
                    .returning({ id: usersTable.id });
                await tx
                    .insert(userStatsTable)
                    .values({ user_id: insertResult.id });
                const [roleId] = await tx
                    .select({ id: rolesTable.id })
                    .from(rolesTable)
                    .where(eq(rolesTable.name, "default"));
                await tx.insert(userRolesTable).values({
                    user_id: insertResult.id,
                    role_id: roleId.id,
                });
            })
            .catch((e) => postgresErrorHandler(e));

        if (maybeError) {
            // TODO: test this somehow (idk what could cause the fauilure here)
            const res = {
                message: "user not created",
                error: {
                    message: maybeError.message,
                    case: "server",
                },
            } satisfies ApiResponse;
            return c.json(res, 400);
        }

        // TODO: make cron job to delete expired tokens
        const emailToken = new Bun.CryptoHasher("sha256")
            .update(registerUserData.email + Date.now() + randomBytes(15))
            .digest("hex");

        if (!insertResult) {
            throw new Error("insertResult is undefined");
        }
        await db.insert(userTokensTable).values({
            user_id: insertResult.id,
            token: emailToken,
            token_type: "email",
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
        });

        await sendEmail(registerUserData.email, emailToken, "verify");

        const res = {
            message: "user created",
        } satisfies ApiResponse;
        return c.json(res, 200);
    }
);

export default registerHandler;
