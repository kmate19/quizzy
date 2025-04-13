// @ts-nocheck

import { app } from "@/index";
import { beforeEach, describe, test, expect } from "bun:test";
import { testClient } from "hono/testing";
import { registerAndLogin } from "./utils/helper";
import { reset } from "drizzle-seed";
import db from "@/db";
import * as schema from "@/db/schemas/index";
import GLOBALS from "@/config/globals";
import { smallBase64Img } from "./utils/constants";
import { randomUUIDv7 } from "bun";
import { eq } from "drizzle-orm";

const client = testClient(app).api.v1;

beforeEach(async () => {
    await reset(db, schema);
    for (let i = 0; i < GLOBALS.DB_ROLES.length; i++) {
        await db
            .insert(schema.rolesTable)
            .values(GLOBALS.DB_ROLES[i])
            .onConflictDoNothing();
        await db
            .insert(schema.tagsTable)
            .values({ name: "test tag" })
            .onConflictDoNothing();
        await db
            .insert(schema.tagsTable)
            .values({ name: "test tag2" })
            .onConflictDoNothing();
        await db
            .insert(schema.languagesTable)
            .values({ name: "test language", iso_code: "TS", icon: "dklja" })
            .onConflictDoNothing();
        await db
            .insert(schema.languagesTable)
            .values({ name: "test language2", iso_code: "SS", icon: "dkljaa" })
            .onConflictDoNothing();
    }
});

async function publisTestQuiz(
    client: any,
    cookies: string[],
    idx: string,
    status: string = "published",
    extra?: { [key: string]: any }
) {
    const tags = ["test tag"];
    const langs = ["TS"];
    if (extra?.tag) tags.push(extra.tag);
    if (extra?.lang) langs.push(extra.lang);
    const pub = await client.quizzes.publish.$post(
        {
            json: {
                quiz: {
                    title: `test quiz${idx}`,
                    description: "test quiz description",
                    status: status,
                    banner: smallBase64Img,
                },
                cards: [
                    {
                        type: "normal",
                        question: "test question",
                        answers: ["test answer"],
                        correct_answer_index: 0,
                        picture: smallBase64Img,
                    },
                ],
                tagNames: tags,
                languageISOCodes: langs,
            },
        },
        { headers: { cookie: cookies.join(";") } }
    );
    expect(pub.status).toBe(201);
    return pub;
}

describe("quiz related routes", async () => {
    describe("search quizzes", async () => {
        test("should return quizzes with relevant data", async () => {
            const { cookies } = await registerAndLogin(client);
            for (let i = 0; i < 9; ++i) {
                await publisTestQuiz(
                    client,
                    cookies,
                    i.toString() + "asd",
                    "published",
                    {
                        tag: Math.random() > 0.5 ? "test tag2" : undefined,
                        lang: Math.random() > 0.5 ? "SS" : undefined,
                    }
                );
            }
            await publisTestQuiz(client, cookies, "asd", "published", {
                tag: "test tag2",
                lang: "SS",
            });

            const req1 = await client.quizzes.search.$get(
                {
                    query: {
                        query: "test quiz4asd",
                    },
                },
                { headers: { cookie: cookies.join(";") } }
            );
            expect(req1.status).toBe(200);
            const jdson = await req1.json();
            expect(jdson.data.quizzes[0].title).toBe("test quiz4asd");

            const req2 = await client.quizzes.search.$get(
                {
                    query: {
                        tagNames: ["test tag2"],
                    },
                },
                { headers: { cookie: cookies.join(";") } }
            );
            expect(req2.status).toBe(200);

            if (req2.status === 200) {
                const jdson2 = await req2.json();
                jdson2.data.quizzes.forEach((q: any) => console.log(q.title));
                console.log(jdson2.data.quizzes[0].tags);
                expect(
                    jdson2.data.quizzes.every((q) =>
                        q.tags.some((t) => t.tag.name === "test tag2")
                    )
                ).toBe(true);
            }

            const req3 = await client.quizzes.search.$get(
                {
                    query: {
                        languageISOCodes: ["SS"],
                    },
                },
                { headers: { cookie: cookies.join(";") } }
            );
            expect(req3.status).toBe(200);
            if (req3.status === 200) {
                const jdson3 = await req3.json();
                console.log(jdson3.data.quizzes[0].languages);
                expect(
                    jdson3.data.quizzes.every((q) =>
                        q.languages.some((l) => l.language.iso_code === "SS")
                    )
                ).toBe(true);
            }

            const req4 = await client.quizzes.search.$get(
                {
                    query: {
                        languageISOCodes: ["SS"],
                        tagNames: ["test tag2"],
                        strict: "true",
                    },
                },
                { headers: { cookie: cookies.join(";") } }
            );
            expect(req4.status).toBe(200);
            if (req4.status === 200) {
                const jdson4 = await req4.json();
                expect(
                    jdson4.data.quizzes.every((q) => {
                        console.log(q.languages);
                        console.log(q.tags);
                        const a = q.languages.some(
                            (l) => l.language.iso_code === "SS"
                        );
                        const b = q.tags.some(
                            (t) => t.tag.name === "test tag2"
                        );

                        return a && b;
                    })
                ).toBe(true);
            }
        });
    });
    describe("edit quiz", async () => {
        test("should edit quiz with relevant data", async () => {
            const { cookies } = await registerAndLogin(client);

            const post = await publisTestQuiz(client, cookies, 0);
            expect(post.status).toBe(201);

            const { data } = await post.json();

            const edit = await client.quizzes.edit[":quizId"].$patch(
                {
                    json: {
                        quiz: {
                            title: `test quiz0 edited`,
                            description: "test quiz description edited",
                            status: "draft",
                            banner: smallBase64Img,
                        },
                        cards: [
                            {
                                type: "normal",
                                question: "test question edited",
                                answers: ["test answer edited"],
                                correct_answer_index: 0,
                                picture: smallBase64Img,
                            },
                        ],
                        tags: ["test tag2"],
                        languageISOCodes: ["TS", "SS"],
                    },
                    param: { quizId: data.id },
                },
                { headers: { cookie: cookies.join(";") } }
            );

            expect(edit.status).toBe(200);

            const quiz = await db.query.quizzesTable.findFirst({
                where: eq(schema.quizzesTable.id, data.id),
                with: {
                    cards: true,
                    tags: {
                        columns: {},
                        with: {
                            tag: {
                                columns: {
                                    name: true,
                                },
                            },
                        },
                    },
                    languages: {
                        columns: {},
                        with: {
                            language: {
                                columns: {
                                    name: true,
                                    iso_code: true,
                                    support: true,
                                    icon: true,
                                },
                            },
                        },
                    },
                },
            });

            console.log(quiz);
            console.log(quiz?.languages);
            console.log(quiz?.tags);
        });
    });
    describe("create quiz", async () => {
        test("should create quiz with relevant data", async () => {
            const { cookies } = await registerAndLogin(client);

            const post = await publisTestQuiz(client, cookies, 0);
            expect(post.status).toBe(201);
        });
        test("fails if non existing language", async () => {
            const { cookies } = await registerAndLogin(client);

            const post = await client.quizzes.publish.$post(
                {
                    json: {
                        quiz: {
                            title: `test quiz0`,
                            description: "test quiz description",
                            status: "draft",
                            banner: smallBase64Img,
                        },
                        cards: [
                            {
                                type: "normal",
                                question: "test question",
                                answers: ["test answer"],
                                correct_answer_index: 0,
                                picture: smallBase64Img,
                            },
                        ],
                        languageISOCodes: ["BG"],
                    },
                },
                { headers: { cookie: cookies.join(";") } }
            );
            const json = await post.json();
            expect(post.status).toBe(400);
            console.error(json);
            // @ts-ignore
            // expect(json.error.message).toBe("Language BG not found");
        });
        test("fails if non existing tag", async () => {
            const { cookies } = await registerAndLogin(client);
            const post = await client.quizzes.publish.$post(
                {
                    json: {
                        quiz: {
                            title: `test quiz0`,
                            description: "test quiz description",
                            status: "draft",
                            banner: smallBase64Img,
                        },
                        cards: [
                            {
                                type: "normal",
                                question: "test question",
                                answers: ["test answer"],
                                correct_answer_index: 0,
                                picture: smallBase64Img,
                            },
                        ],
                        tagNames: ["doesntexist"],
                    },
                },
                { headers: { cookie: cookies.join(";") } }
            );

            expect(post.status).toBe(400);
            // @ts-ignore
            // expect((await post.json()).error.message).toBe(
            //     "Tag doesntexist not found"
            // );
        });
        test("should not create quiz with invalid data", async () => {
            const { cookies } = await registerAndLogin(client);
            const postBanner = await client.quizzes.publish.$post(
                {
                    json: {
                        quiz: {
                            title: `test quiz0`,
                            description: "test quiz description",
                            status: "draft",
                            banner: "bad banner",
                        },
                        cards: [
                            {
                                type: "normal",
                                question: "test question",
                                answers: ["test answer"],
                                correct_answer_index: 0,
                                picture: smallBase64Img,
                            },
                        ],
                    },
                },
                { headers: { cookie: cookies.join(";") } }
            );

            expect(postBanner.ok).toBe(false);
            expect(postBanner.status).toBe(400);
            // expect((await postBanner.json()).message).toInclude("banner");

            const postCard = await client.quizzes.publish.$post(
                {
                    json: {
                        quiz: {
                            title: `test quiz0`,
                            description: "test quiz description",
                            status: "draft",
                            banner: smallBase64Img,
                        },
                        cards: [
                            {
                                type: "normal",
                                question: "test question",
                                answers: ["test answer"],
                                correct_answer_index: 0,
                                picture: "bad card",
                            },
                        ],
                    },
                },
                { headers: { cookie: cookies.join(";") } }
            );

            expect(postCard.ok).toBe(false);
            expect(postCard.status).toBe(400);
            // expect((await postCard.json()).message).toInclude("cards");
        });
    });
    describe("get quiz by user", async () => {
        test("should return users quizzes (only published) with relevant data", async () => {
            const { cookies } = await registerAndLogin(client);
            const post = await publisTestQuiz(client, cookies, 0);
            expect(post.status).toBe(201);

            const post1 = await publisTestQuiz(client, cookies, 1, "draft");
            expect(post1.status).toBe(201);

            const [userid] = await db
                .select({ id: schema.usersTable.id })
                .from(schema.usersTable)
                .where(eq(schema.usersTable.username, "mateka"));

            const quiz = await client.quizzes.by[":userId"].$get(
                { param: { userId: userid.id } },
                { headers: { cookie: cookies.join(";") } }
            );
            expect(quiz.status).toBe(200);

            if (quiz.status !== 200) return;
            const { data } = await quiz.json();

            expect(data.length).toBe(1);
            expect(data[0].title).toBe("test quiz0");
        });
    });
    describe("get quiz by id", async () => {
        test("should return quiz with relevant data", async () => {
            const { cookies } = await registerAndLogin(client);
            const post = await publisTestQuiz(client, cookies, 0);
            expect(post.status).toBe(201);

            const { data } = await post.json();

            const quiz = await client.quizzes[":quizId"].$get(
                { param: { quizId: data.id } },
                { headers: { cookie: cookies.join(";") } }
            );
            expect(quiz.status).toBe(200);

            if (quiz.status !== 200) return;
            const { data: quizData } = await quiz.json();

            expect(quizData.title).toBe("test quiz0");
            expect(quizData.description).toBe("test quiz description");
            expect(quizData.user.username).toBe("mateka");
            expect(quizData.tags[0].tag.name).toBe("test tag");
            expect(quizData.languages[0].language.name).toBe("test language");
            quizData.cards.forEach((card: any) => {
                expect(card.type).toBe("normal");
                expect(card.question).toBe("test question");
                expect(card.answers[0]).toBe("test answer");
                expect(card.correct_answer_index).toBe(0);
            });
        });
        test("should not return quizzes that are not of published status", async () => {
            const { cookies } = await registerAndLogin(client);

            const post = await publisTestQuiz(client, cookies, 0, "draft");
            expect(post.status).toBe(201);

            const { data } = await post.json();

            const quiz = await client.quizzes[":quizId"].$get(
                { param: { quizId: data.id } },
                { headers: { cookie: cookies.join(";") } }
            );
            expect(quiz.status).toBe(404);
        });
        test("should return 404 if quiz is not found", async () => {
            const { cookies } = await registerAndLogin(client);

            const quiz = await client.quizzes[":quizId"].$get(
                { param: { quizId: randomUUIDv7() } },
                { headers: { cookie: cookies.join(";") } }
            );
            expect(quiz.status).toBe(404);
        });
    });
    describe("get own quizzes", async () => {
        test("should not return other users quizzes", async () => {
            const { cookies } = await registerAndLogin(client);

            const otherUserCookies = (
                await registerAndLogin(client, {
                    username: "otheruser",
                    password: "otherpassword",
                    email: "test2",
                })
            ).cookies;

            const post = await publisTestQuiz(client, cookies, 0);
            expect(post.status).toBe(201);

            const postOther = await publisTestQuiz(
                client,
                otherUserCookies,
                11
            );
            expect(postOther.status).toBe(201);

            const quizzes = await client.quizzes.own.$get(
                { query: {} },
                { headers: { cookie: cookies.join(";") } }
            );
            expect(quizzes.status).toBe(200);

            const { data } = await quizzes.json();

            expect(data.length).toBe(1);
            expect(data[0].title).toBe("test quiz0");
        });
        test("should return all own quizzes (even non published ones) with relevant data", async () => {
            const { cookies } = await registerAndLogin(client);

            const post = await publisTestQuiz(client, cookies, 0);
            expect(post.status).toBe(201);

            const post1 = await publisTestQuiz(client, cookies, 1, "draft");
            expect(post1.status).toBe(201);

            const post2 = await publisTestQuiz(
                client,
                cookies,
                2,
                "requires_review"
            );
            expect(post2.status).toBe(201);

            const post3 = await publisTestQuiz(client, cookies, 3, "private");
            expect(post3.status).toBe(201);

            const quizzes = await client.quizzes.own.$get(
                { query: {} },
                { headers: { cookie: cookies.join(";") } }
            );
            expect(quizzes.status).toBe(200);

            const { data } = await quizzes.json();

            expect(data.length).toBe(4);
            data.forEach((quiz: any, idx: number) => {
                expect(quiz.title).toBe(`test quiz${idx}`);
                expect(quiz.description).toBe("test quiz description");
                expect(quiz.tags[0].tag.name).toBe("test tag");
                expect(quiz.languages[0].language.name).toBe("test language");
            });
        });
    });
    describe("get quizzes", async () => {
        test("should return all quizzes with relevant data", async () => {
            const { cookies } = await registerAndLogin(client);
            const post = await publisTestQuiz(client, cookies, 0);
            expect(post.status).toBe(201);

            const quizzes = await client.quizzes.$get(
                { query: {} },
                { headers: { cookie: cookies.join(";") } }
            );
            expect(quizzes.status).toBe(200);

            const { data } = await quizzes.json();

            expect(data.quizzes.length).toBe(1);
            expect(data.quizzes[0].title).toBe("test quiz0");
            expect(data.quizzes[0].description).toBe("test quiz description");
            expect(data.quizzes[0].user.username).toBe("mateka");
            expect(data.quizzes[0].tags[0].tag.name).toBe("test tag");
            expect(data.quizzes[0].languages[0].language.name).toBe(
                "test language"
            );
        });
        test("should return with correct limits and offsets", async () => {
            const { cookies } = await registerAndLogin(client);
            for (let i = 0; i < 10; ++i) {
                await publisTestQuiz(client, cookies, i);
            }
            const { cookies: cookies1 } = await registerAndLogin(client, {
                username: "m",
                email: "m",
                password: "m",
            });
            for (let i = 10; i < 20; ++i) {
                await publisTestQuiz(client, cookies1, i);
            }
            const { cookies: cookies2 } = await registerAndLogin(client, {
                username: "m1",
                email: "m1",
                password: "m",
            });
            for (let i = 20; i < 30; ++i) {
                await publisTestQuiz(client, cookies2, i);
            }
            const { cookies: cookies3 } = await registerAndLogin(client, {
                username: "m2",
                email: "m2",
                password: "m",
            });
            for (let i = 30; i < 40; ++i) {
                await publisTestQuiz(client, cookies3, i);
            }
            const { cookies: cookies4 } = await registerAndLogin(client, {
                username: "m3",
                email: "m3",
                password: "m",
            });
            for (let i = 40; i < 50; ++i) {
                await publisTestQuiz(client, cookies4, i);
            }

            const quizzes = await client.quizzes.$get(
                { query: {} },
                { headers: { cookie: cookies.join(";") } }
            );
            const quizzes30 = await client.quizzes.$get(
                { query: { limit: "30" } },
                { headers: { cookie: cookies.join(";") } }
            );
            const quizzes301 = await client.quizzes.$get(
                { query: { limit: "30", page: "2" } },
                { headers: { cookie: cookies.join(";") } }
            );

            const data = (await quizzes.json()).data.quizzes;
            const data30 = (await quizzes30.json()).data.quizzes;

            expect(quizzes.status).toBe(200);
            expect(data.length).toBe(20);
            expect(quizzes30.status).toBe(200);
            expect(data30.length).toBe(30);
            expect(quizzes301.status).toBe(200);
            expect((await quizzes301.json()).data.quizzes.length).toBe(20);
        });
        test("should not return quizzes that are not of published status", async () => {
            const { cookies } = await registerAndLogin(client);

            const post = await publisTestQuiz(client, cookies, 0, "draft");
            expect(post.status).toBe(201);

            const post1 = await publisTestQuiz(
                client,
                cookies,
                1,
                "requires_review"
            );
            expect(post1.status).toBe(201);

            const post2 = await publisTestQuiz(client, cookies, 2, "private");
            expect(post2.status).toBe(201);

            const quizzes = await client.quizzes.$get(
                { query: {} },
                { headers: { cookie: cookies.join(";") } }
            );
            expect(quizzes.status).toBe(200);

            const { data } = await quizzes.json();

            expect(data.totalCount).toBe(0);
            expect(data.quizzes.length).toBe(0);
        });
    });
});
