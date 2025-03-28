import quizFinishedHandlers from "@/controllers/events/quiz-finished";
import { quizFinishedDesc } from "@/openapi/events-openapi";
import { Hono } from "hono";

const events = new Hono()
    .basePath("/events")
    .post("/quiz-finished", quizFinishedDesc, ...quizFinishedHandlers);

export default events;
