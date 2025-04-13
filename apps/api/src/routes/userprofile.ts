import getBaseDataHandler from "@/controllers/userprofile/get";
import getProfileByIdHandler from "@/controllers/userprofile/get-by-id";
import postProfilePictureHandler from "@/controllers/userprofile/post-profile-picture";
import {
    getUserProfileDesc,
    updateUserPictureDesc,
    getUserProfileByIdDesc,
} from "@/openapi/userprofile-openapi";
import { Hono } from "hono";
const userprofile = new Hono()
    .basePath("/userprofile")
    .get("/", getUserProfileDesc, ...getBaseDataHandler)
    .post("/profilepic", updateUserPictureDesc, ...postProfilePictureHandler)
    .get("/:userId", getUserProfileByIdDesc, ...getProfileByIdHandler);

export default userprofile;
