import quizFinishedHandlers from "@/controllers/events/quiz-finished";
import { Hono } from "hono";

const events = new Hono()
    .basePath("/events")
    .get("/quiz-finished", ...quizFinishedHandlers);

export default events;
