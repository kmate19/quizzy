import { Hono } from "hono";
import getHandlers from "@/controllers/quizzes/get";
import getByIdHandlers from "@/controllers/quizzes/get-by-id";
import getByUserIdHandlers from "@/controllers/quizzes/get-by-user-id";
import getOwnHandlers from "@/controllers/quizzes/get-own";
import getOwnByIdHandlers from "@/controllers/quizzes/get-own-by-id";
import publishHandlers from "@/controllers/quizzes/publish";
import editHandlers from "@/controllers/quizzes/edit";
import deleteHandlers from "@/controllers/quizzes/delete";
import { z } from "zod";
import { resolver } from "hono-openapi/zod";
import { describeRoute } from "hono-openapi";

const publishQuizDesc = describeRoute({
    description: "Publish a new quiz with cards, optional languages and tags for the authenticated user",
    responses: {
        201: {
            description: "Success - Quiz published",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({
                            message: z.literal("Quiz published"),
                            data: z.object({
                                id: z.string()
                            })
                        })
                    )
                }
            },
        },
        400: {
            description: "Bad Request - Invalid data provided",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({
                            message: z.string(),
                            error: z.object({
                                message: z.string(),
                                case: z.literal("bad_request")
                            })
                        })
                    )
                }
            },
        },
    }
});

const getQuizzesDesc = describeRoute({
    description: "Fetch published quizzes with pagination, including associated user, tags, and languages",
    responses: {
        200: {
            description: "Success - Quizzes fetched",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({
                            message: z.literal("Quizzes fetched"),
                            data: z.array(
                                z.object({
                                    id: z.string(),
                                    user: z.object({
                                        username: z.string(),
                                    }),
                                    tags: z.array(
                                        z.object({
                                            tag: z.object({
                                                name: z.string(),
                                            }),
                                        })
                                    ),
                                    languages: z.array(
                                        z.object({
                                            language: z.object({
                                                name: z.string(),
                                                iso_code: z.string(),
                                                support: z.string(),
                                                icon: z.string(),
                                            }),
                                        })
                                    ),
                                })
                            ),
                        })
                    )
                }
            },
        },
        400: {
            description: "Bad Request - Invalid query parameters",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({
                            message: z.string(),
                            error: z.object({
                                message: z.string(),
                                case: z.literal("bad_request"),
                            }),
                        })
                    )
                }
            },
        }
    }
});

const quizzes = new Hono().basePath("/quizzes")
    // TODO: this should be a strict route in the real world where we validate
    // more rigorously, instead there should be a separate route for uploading
    // drafts where we do less validation, as drafts are only exposed to their
    // creators
    .post("/publish", publishQuizDesc, ...publishHandlers)
    // gets max 50, default 20, minimum 10 limit quizzes at once
    .get("/", getQuizzesDesc, ...getHandlers)
    .get("/own", ...getOwnHandlers)
    .get("/by/:userId", ...getByUserIdHandlers)
    .get("/own/:quizId", ...getOwnByIdHandlers)
    .patch("/edit/:quizId", ...editHandlers)
    .delete("/delete/:quizId", ...deleteHandlers)
    .get("/:quizId", ...getByIdHandlers);

export default quizzes;
