import getBaseDataHandler from "@/controllers/userprofile/get";
import getProfileByIdHandler from "@/controllers/userprofile/get-by-id";
import getProfilePictureHandler from "@/controllers/userprofile/get-profile-picture";
import getProfilePictureByIdHandler from "@/controllers/userprofile/get-profile-picture-by-id";
import postProfilePictureHandler from "@/controllers/userprofile/post-profile-picture";
import { Hono } from "hono";

const userprofile = new Hono().basePath("/userprofile")
    .get("/", ...getBaseDataHandler)
    .get("/profilepic", ...getProfilePictureHandler)
    .post("/profilepic", ...postProfilePictureHandler)
    .get("/:uuid", ...getProfileByIdHandler)
    .get("/profilepicuuid/:uuid", ...getProfilePictureByIdHandler)

export default userprofile;
