import GLOBALS from "@/config/globals";
import db from "@/db";
import { usersTable } from "@/db/schemas";
import checkJwt from "@/middlewares/check-jwt";
import { processImage } from "@/utils/helpers";
import { eq } from "drizzle-orm";
import { fileTypeFromBlob } from "file-type";
import { ApiResponse } from "repo";

// TODO: maybe try writing a zod validator for this
const postProfilePictureHandler = GLOBALS.CONTROLLER_FACTORY(
    checkJwt(),
    async (c) => {
        const { userId } = c.get("accessTokenPayload");
        const imgBlob = await c.req.blob();

        const fileInfo = await fileTypeFromBlob(imgBlob);

        if (!fileInfo || !fileInfo.mime.startsWith("image/")) {
            const res = {
                message: "Érvénytelen fájltípus",
                error: {
                    message: "invalid_file_type",
                    case: "bad_request",
                },
            } satisfies ApiResponse;

            return c.json(res, 400);
        }

        if (imgBlob.size > 1024 * 1024) {
            const res = {
                message: "A fájl túl nagy, maximum 1MB",
                error: {
                    message: "file_too_large",
                    case: "bad_request",
                },
            } satisfies ApiResponse;

            return c.json(res, 400);
        }

        let pfpBuf: Buffer;
        try {
            pfpBuf = Buffer.from(await imgBlob.bytes());
        } catch (e) {
            console.error("ERROR: Uploading pfp buffer parse:", e);
            const res = {
                message: "Érvénytelen profil kép",
                error: {
                    message: "invalid_pfp_blob",
                    case: "bad_request",
                },
            } satisfies ApiResponse;

            return c.json(res, 400);
        }

        const finalImage = await processImage(pfpBuf);

        try {
            await db
                .update(usersTable)
                .set({ profile_picture: finalImage })
                .where(eq(usersTable.id, userId));
        } catch (e) {
            console.error("ERROR: Uploading pfp to db:", e);
            throw e;
        }

        const res = {
            message: "Sikeres",
        } satisfies ApiResponse;

        return c.json(res, 200);
    }
);

export default postProfilePictureHandler;
