import GLOBALS from "@/config/globals";
import db from "@/db";
import { usersTable } from "@/db/schemas";
import checkJwt from "@/middlewares/checkJwt";
import { eq } from "drizzle-orm";
import { fileTypeFromBlob } from "file-type";
import { ApiResponse } from "repo";
import sharp from "sharp";


// TODO: maybe try writing a zod validator for this
const postProfilePictureHandler = GLOBALS.CONTROLLER_FACTORY(checkJwt(), async (c) => {
    const { userId } = c.get("accessTokenPayload");
    const imgBlob = await c.req.blob()

    const fileInfo = await fileTypeFromBlob(imgBlob);

    if (!fileInfo || !fileInfo.mime.startsWith('image/')) {
        const res = {
            message: "Invalid file type",
            error: {
                message: "invalid_file_type",
                case: "bad_request",
            }
        } satisfies ApiResponse;

        return c.json(res, 400);
    }

    if (imgBlob.size > 1024 * 1024) {
        const res = {
            message: "File too large maximum 1MB",
            error: {
                message: "file_too_large",
                case: "bad_request",
            }
        } satisfies ApiResponse;

        return c.json(res, 400);
    }

    let pfpBuf: Buffer;
    try {
        pfpBuf = Buffer.from(await imgBlob.bytes());
    } catch (e) {
        console.error('ERROR: Uploading pfp buffer parse:', e);
        const res = {
            message: "Invalid pfpBlob",
            error: {
                message: "invalid_pfp_blob",
                case: "bad_request",
            }
        } satisfies ApiResponse;

        return c.json(res, 400);
    }

    const finalImage = await sharp(pfpBuf).resize(200, 200).jpeg().toBuffer();

    try {
        await db.update(usersTable).set({ profile_picture: finalImage }).where(eq(usersTable.id, userId));
    }
    catch (e) {
        console.error('ERROR: Uploading pfp to db:', e);
        const res = {
            message: "Error uploading profile picture",
            error: {
                message: "error_uploading_profile_picture",
                case: "server",
            }
        } satisfies ApiResponse;

        return c.json(res, 500);
    }


    const res = {
        message: "Success",
    } satisfies ApiResponse;

    return c.json(res, 200);
})

export default postProfilePictureHandler;
