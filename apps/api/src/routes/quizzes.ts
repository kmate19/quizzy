import getHandlers from "@/controllers/quizzes/get";
import getByIdHandlers from "@/controllers/quizzes/get-by-id";
import getByUserIdHandlers from "@/controllers/quizzes/get-by-user-id";
import getOwnHandlers from "@/controllers/quizzes/get-own";
import publishHandlers from "@/controllers/quizzes/publish";
import { Hono } from "hono";

const quizzes = new Hono().basePath("/quizzes")
    // TODO: this should be a strict route in the real world where we validate
    // more rigorously, instead there should be a separate route for uploading
    // drafts where we do less validation, as drafts are only exposed to their
    // creators
    .post("/publish", ...publishHandlers)
    // gets max 50, default 20, minimum 10 limit quizzes at once
    .get("/", ...getHandlers)
    .get("/own", ...getOwnHandlers)
    .get("/by/:uuid", ...getByUserIdHandlers)
    .get("/:uuid", ...getByIdHandlers);

export default quizzes;
