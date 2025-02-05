import { Hono } from "hono";

const quizzes = new Hono().basePath("/quizzes")
    // TODO: this should be a strict route in the real world where we validate
    // more rigorously, instead there should be a separate route for uploading
    // drafts where we do less validation, as drafts are only exposed to their
    // creators
    .post("/publish",)
    // gets max 50, default 20, minimum 10 limit quizzes at once
    .get("/",)
    // gets max 50, default 20, minimum 10 limit own quizzes at once
    .get("/own")
    .get("/:uuid",);

export default quizzes;
