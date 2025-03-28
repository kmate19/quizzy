import { Hono } from "hono";
import getHandlers from "@/controllers/quizzes/get";
import getByIdHandlers from "@/controllers/quizzes/get-by-id";
import getByUserIdHandlers from "@/controllers/quizzes/get-by-user-id";
import getOwnHandlers from "@/controllers/quizzes/get-own";
import getOwnByIdHandlers from "@/controllers/quizzes/get-own-by-id";
import publishHandlers from "@/controllers/quizzes/publish";
import editHandlers from "@/controllers/quizzes/edit";
import deleteHandlers from "@/controllers/quizzes/delete";
import {
    deleteQuizDesc,
    editQuizDesc,
    getOwnQuizByIdDesc,
    getOwnQuizzesDesc,
    getQuizByIdDesc,
    getQuizzesByUserIdDesc,
    getQuizzesDesc,
    publishQuizDesc,
    searchQuizzesDesc,
} from "@/openapi/quizzes-openapi";
import searchHandlers from "@/controllers/quizzes/search";

const quizzes = new Hono()
    .basePath("/quizzes")
    // TODO: this should be a strict route in the real world where we validate
    // more rigorously, instead there should be a separate route for uploading
    // drafts where we do less validation, as drafts are only exposed to their
    // creators
    .post("/publish", publishQuizDesc, ...publishHandlers)
    // gets max 50, default 20, minimum 10 limit quizzes at once
    .get("/", getQuizzesDesc, ...getHandlers)
    .get("/own", getOwnQuizzesDesc, ...getOwnHandlers)
    .get("/by/:userId", getQuizzesByUserIdDesc, ...getByUserIdHandlers)
    .get("/own/:quizId", getOwnQuizByIdDesc, ...getOwnByIdHandlers)
    .get("/search", searchQuizzesDesc, ...searchHandlers)
    .patch("/edit/:quizId", editQuizDesc, ...editHandlers)
    .delete("/delete/:quizId", deleteQuizDesc, ...deleteHandlers)
    .get("/:quizId", getQuizByIdDesc, ...getByIdHandlers);

export default quizzes;
