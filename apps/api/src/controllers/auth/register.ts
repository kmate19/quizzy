import ENV from "@/config/env.ts";
import GLOBALS from "@/config/globals.ts";
import db from "@/db/index.ts";
import { rolesTable } from "@/db/schemas/rolesSchema.ts";
import { userRolesTable } from "@/db/schemas/userRolesSchema.ts";
import { RegisterUserSchema, usersTable } from "@/db/schemas/usersSchema.ts";
import { userTokensTable } from "@/db/schemas/userTokensSchema.ts";
import getOneStrict from "@/utils/db/getOneStrict.ts";
import postgresErrorHandler from "@/utils/db/postgresErrorHandler.ts";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";

const registerHandler = GLOBALS.CONTROLLER_FACTORY(zValidator('json', RegisterUserSchema), async (c) => {
    const registerUserData = c.req.valid('json')

    // PERF: Probably would be better to check if the user is duplicate first and maybe use worker threads
    try {
        registerUserData.password = await Bun.password.hash(registerUserData.password);
    } catch (error) {
        c.status(500);
        return;
    }

    let insertResult;
    try {
        await db.transaction(async (tx) => {
            insertResult = getOneStrict(await tx.insert(usersTable).values(registerUserData).returning({ id: usersTable.id }));
            const roleId = getOneStrict(await tx.select({ id: rolesTable.id }).from(rolesTable).where(eq(rolesTable.name, "default")))
            await tx.insert(userRolesTable).values({
                user_id: insertResult.id,
                role_id: roleId.id
            });
        });
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

    const emailToken = new Bun.CryptoHasher("sha1").update(registerUserData.email).digest("hex");

    try {
        // TODO: make cron job to delete expired tokens
        await db.insert(userTokensTable).values({ user_id: insertResult!.id, token: emailToken, token_type: "email", expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24) });
    } catch (error) {
        c.status(500);
        return;
    }


    // NOTE: Worker paths need to be from the CWD of the running script, not relative to the file that imports it XD!
    // also workers silently throw errors which dont get propogated to the main thread, so we need to event listener haha
    // actually this still doesnt work since bun docs are wrong, after compiling the file extension becomes .js so thats why it cant find the file in prod
    // ALSO THE RELATIVE PATHS NEED TO BE CHANGED SINCE FOLDER STRUCTURE CHANGES AFTER COMPILATION 
    // (why am i even compiling if theres one more issue because of this, im refactoring)
    const workerExtension = ENV.NODE_ENV() === "production" ? ".js" : ".ts";
    const workerRelativePath = ENV.NODE_ENV() === "production" ? "./" : "../../";
    const worker = new Worker(new URL(workerRelativePath + "workers/emailWorker" + workerExtension, import.meta.url).href);
    worker.onerror = (e) => {
        console.error(e);
    };
    worker.postMessage({ email: registerUserData.email, emailToken });

    return c.redirect("/login");
})

export default registerHandler;
