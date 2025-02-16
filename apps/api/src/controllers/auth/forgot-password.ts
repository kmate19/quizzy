import GLOBALS from "@/config/globals";
import db from "@/db/index";
import { userTokensTable } from "@/db/schemas";
import { LoginUserSchema, usersTable } from "@/db/schemas/usersSchema";
import { zv } from "@/middlewares/zv";
import { and, eq, or } from "drizzle-orm";
import type { ApiResponse } from "repo";
import { randomBytes } from "node:crypto";

const forgotPasswordHandler = GLOBALS.CONTROLLER_FACTORY(
    zv("json", LoginUserSchema.omit({ password: true })),
    async (c) => {
        const loginUserData = c.req.valid("json");

        const [user] = await db
            .select()
            .from(usersTable)
            .where(
                or(
                    eq(usersTable.username, loginUserData.username_or_email),
                    eq(usersTable.email, loginUserData.username_or_email)
                )
            );

        if (!user) {
            // do this to prevent user enumeration
            const res = {
                message:
                    "If the email exists, a reset password link has been sent to the email",
            } satisfies ApiResponse;
            return c.json(res, 200);
        }

        // send email with reset password link
        const emailToken = new Bun.CryptoHasher("sha256")
            .update(
                loginUserData.username_or_email + Date.now() + randomBytes(15)
            )
            .digest("hex");

        const exist = await db
            .select()
            .from(userTokensTable)
            .where(
                and(
                    eq(userTokensTable.user_id, user.id),
                    eq(userTokensTable.token_type, "forgot_password")
                )
            );

        if (exist.length > 0) {
            await db
                .delete(userTokensTable)
                .where(
                    and(
                        eq(userTokensTable.user_id, user.id),
                        eq(userTokensTable.token_type, "forgot_password")
                    )
                );
        }

        const randomPassword = randomBytes(16).toString("hex").slice(0, 16);

        const hashhedRandomPassword = await Bun.password.hash(randomPassword);

        // TODO: hash password inside token data too
        await db.insert(userTokensTable).values({
            user_id: user.id,
            token: emailToken,
            data: hashhedRandomPassword,
            token_type: "forgot_password",
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
        });

        const worker = new Worker(
            new URL(
                GLOBALS.WORKERCONF.workerRelativePath +
                    "workers/email-worker" +
                    GLOBALS.WORKERCONF.workerExtension,
                import.meta.url
            ).href
        );
        worker.onerror = (e) => {
            console.error(e);
        };
        worker.postMessage({
            email: user.email,
            emailToken,
            type: "forgot_password",
            data: randomPassword,
        });

        const res = {
            message:
                "If the email exists, a reset password link has been sent to the email",
        } satisfies ApiResponse;

        return c.json(res, 200);
    }
);

export default forgotPasswordHandler;
