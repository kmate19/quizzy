import getBaseDataHandler from "@/controllers/userprofile/get";
import getProfileByIdHandler from "@/controllers/userprofile/get-by-id";
import postProfilePictureHandler from "@/controllers/userprofile/post-profile-picture";
import { getUserprofileDesc } from "@/openapi/userprofile-openapi";
import { Hono } from "hono";
const userprofile = new Hono()
    .basePath("/userprofile")
    .get("/", getUserprofileDesc, ...getBaseDataHandler)
    .post("/profilepic", ...postProfilePictureHandler)
    .get("/:userId", ...getProfileByIdHandler);

export default userprofile;
