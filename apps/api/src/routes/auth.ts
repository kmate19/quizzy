import db from "@/db/index.ts";
import { LoginUserSchema, RegisterUserSchema, usersTable } from "@/db/schemas/usersSchema.ts";
import postgresErrorHandler from "@/utils/postgresErrorHandler.ts";
import sendEmail from "@/utils/sendEmail.ts";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

const auth = new Hono().basePath("/auth")

    .post("/register", zValidator('json', RegisterUserSchema), async (c) => {
        const userdata = c.req.valid('json')

        // PERF: Probably would be better to check if the user is duplicate first and maybe use worker threads
        try {
            userdata.password = await Bun.password.hash(userdata.password);
        } catch (error) {
            c.status(500);
            return;
        }

        try {
            await db.insert(usersTable).values(userdata);
        } catch (error) {
            const err = postgresErrorHandler(error as Error & { code: string });

            if (err.type === "dup") {
                c.status(400);
                return c.json({ message: `${err.columnName} is already taken!` });
            } else {
                c.status(500);
                return;
            }
        }

        await sendEmail(userdata.email);

        return c.text("Hello Auth!");
    })

    .post("/login", zValidator('json', LoginUserSchema), async (c) => {
        return c.text("Hello Auth!");
    })

    .post("/logout", async (c) => {
        return c.status(404)
    })

    .post("/refresh_token", async (c) => {
        return c.status(404)
    });

export default auth;
