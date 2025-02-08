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

const registerHandler = GLOBALS.CONTROLLER_FACTORY(zv('json', RegisterUserSchema), async (c) => {
    const registerUserData = c.req.valid('json')

    const [user] = await db.select().from(usersTable).where(or(eq(usersTable.email, registerUserData.email), eq(usersTable.username, registerUserData.username)))

    if (user) {
        const message = user.email === registerUserData.email ? "email already exists" : "username already exists";
        const res = {
            message: 'user not created',
            error: {
                message: message,
                case: "auth"
            }
        } satisfies ApiResponse;
        return c.json(res, 400);
    }

    // PERF: maybe use worker threads
    registerUserData.password = await Bun.password.hash(registerUserData.password)

    let insertResult;
    const maybeError = await db.transaction(async (tx) => {
        [insertResult] = await tx.insert(usersTable).values(registerUserData).returning({ id: usersTable.id });
        const [roleId] = await tx.select({ id: rolesTable.id }).from(rolesTable).where(eq(rolesTable.name, "default"))
        await tx.insert(userRolesTable).values({
            user_id: insertResult.id,
            role_id: roleId.id
        });
    }).catch(e => postgresErrorHandler(e));

    if (maybeError) {
        // TODO: test this somehow (idk what could cause the fauilure here)
        const res = {
            message: 'user not created',
            error: {
                message: maybeError.message,
                case: "server"
            }
        } satisfies ApiResponse;
        return c.json(res, 400);
    }

    // TODO: make cron job to delete expired tokens
    const emailToken = new Bun.CryptoHasher("sha1").update(registerUserData.email).digest("hex");

    await db.insert(userTokensTable).values({ user_id: insertResult!.id, token: emailToken, token_type: "email", expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24) });

    // NOTE: Worker paths need to be from the CWD of the running script, not relative to the f
    // ile that imports it XD!
    // also workers silently throw errors which dont get propogated to the main thread, so we need to event listener haha
    // actually this still doesnt work since bun docs are wrong, after compiling the file extension becomes .js so thats why it cant find the file in prod
    // ALSO THE RELATIVE PATHS NEED TO BE CHANGED SINCE FOLDER STRUCTURE CHANGES AFTER COMPILATION 
    // (why am i even compiling if theres one more issue because of this, im refactoring)
    const worker = new Worker(new URL(
        GLOBALS.WORKERCONF.workerRelativePath +
        "workers/email-worker" +
        GLOBALS.WORKERCONF.workerExtension, import.meta.url).href);
    worker.onerror = (e) => {
        console.error(e);
    };
    worker.postMessage({ email: registerUserData.email, emailToken });

    const res = {
        message: 'user created'
    } satisfies ApiResponse;
    return c.json(res, 200);
})

export default registerHandler;
