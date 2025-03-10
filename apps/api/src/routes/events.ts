import quizFinishedHandlers from "@/controllers/events/quiz-finished";
import { Hono } from "hono";

const events = new Hono()
    .basePath("/events")
    .post("/quiz-finished", ...quizFinishedHandlers);

export default events;
