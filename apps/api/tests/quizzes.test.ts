import { app } from '@/index';
import { beforeEach, describe, test, expect } from 'bun:test'
import { testClient } from 'hono/testing';
import { registerAndLogin } from './utils/helper';
import { reset } from 'drizzle-seed';
import db from '@/db';
import * as schema from "@/db/schemas/index";
import GLOBALS from '@/config/globals';
import { smallBase64Img } from './utils/constants';
import { randomUUIDv7 } from 'bun';

const client = testClient(app).api.v1;

beforeEach(async () => {
    await reset(db, schema);
    for (let i = 0; i < GLOBALS.DB_ROLES.length; i++) {
        await db.insert(schema.rolesTable).values(GLOBALS.DB_ROLES[i]).onConflictDoNothing()
        await db.insert(schema.tagsTable).values({ name: "test tag" }).onConflictDoNothing()
        await db.insert(schema.languagesTable).values({ name: "test language", iso_code: "TS", icon: "dklja" }).onConflictDoNothing()
    }
})

async function publisTestQuiz(client: any, cookies: string[], idx: number, status: string = "published") {
    return await client.quizzes.publish.$post({
        json: {
            quiz: {
                title: `test quiz${idx}`,
                description: "test quiz description",
                status: status,
                banner: smallBase64Img
            },
            cards: [{
                type: "normal",
                question: "test question",
                answers: ["test answer"],
                correct_answer_index: 0,
                picture: smallBase64Img
            }],
            tags: [
                "test tag"
            ],
            languages: [
                "TS"
            ]
        }
    }, { headers: { cookie: cookies.join(';') } });
}

describe('quiz related routes', async () => {
    describe('get quiz by id', async () => {
        test('should return quiz with relevant data', async () => {
            const { cookies } = await registerAndLogin(client)
            const post = await publisTestQuiz(client, cookies, 0);
            expect(post.status).toBe(201);

            const { data } = await post.json();

            const quiz = await client.quizzes[':uuid'].$get({ param: { uuid: data.id } }, { headers: { cookie: cookies.join(';') } });
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
            })
        });
        test('should not return quizzes that are not of published status', async () => {
            const { cookies } = await registerAndLogin(client)

            const post = await publisTestQuiz(client, cookies, 0, "draft");
            expect(post.status).toBe(201);

            const { data } = await post.json();

            const quiz = await client.quizzes[':uuid'].$get({ param: { uuid: data.id } }, { headers: { cookie: cookies.join(';') } });
            expect(quiz.status).toBe(404);
        });
        test('should return 404 if quiz is not found', async () => {
            const { cookies } = await registerAndLogin(client)

            const quiz = await client.quizzes[':uuid'].$get({ param: { uuid: randomUUIDv7() } }, { headers: { cookie: cookies.join(';') } });
            expect(quiz.status).toBe(404);
        });
    });
    describe('get own quizzes', async () => {
        test('should not return other users quizzes', async () => {
            const { cookies } = await registerAndLogin(client);

            const otherUserCookies = (await registerAndLogin(client, {
                username: "otheruser",
                password: "otherpassword",
                email: "test@example.org"
            })).cookies;

            const post = await publisTestQuiz(client, cookies, 0);
            expect(post.status).toBe(201);

            const postOther = await publisTestQuiz(client, otherUserCookies, 11);
            expect(postOther.status).toBe(201);

            const quizzes = await client.quizzes.own.$get({ query: {} }, { headers: { cookie: cookies.join(';') } });
            expect(quizzes.status).toBe(200);

            const { data } = await quizzes.json();

            expect(data.length).toBe(1);
            expect(data[0].title).toBe('test quiz0');
        });
        test('should return all own quizzes (even non published ones) with relevant data', async () => {
            const { cookies } = await registerAndLogin(client)

            const post = await publisTestQuiz(client, cookies, 0);
            expect(post.status).toBe(201);

            const post1 = await publisTestQuiz(client, cookies, 1, "draft");
            expect(post1.status).toBe(201);

            const post2 = await publisTestQuiz(client, cookies, 2, "requires_review");
            expect(post2.status).toBe(201);

            const post3 = await publisTestQuiz(client, cookies, 3, "private");
            expect(post3.status).toBe(201);

            const quizzes = await client.quizzes.own.$get({ query: {} }, { headers: { cookie: cookies.join(';') } });
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
    describe('get quizzes', async () => {
        test('should return all quizzes with relevant data', async () => {
            const { cookies } = await registerAndLogin(client)
            const post = await publisTestQuiz(client, cookies, 0);
            expect(post.status).toBe(201);

            const quizzes = await client.quizzes.$get({ query: {} }, { headers: { cookie: cookies.join(';') } });
            expect(quizzes.status).toBe(200);

            const { data } = await quizzes.json();

            expect(data.length).toBe(1);
            expect(data[0].title).toBe("test quiz0");
            expect(data[0].description).toBe("test quiz description");
            expect(data[0].user.username).toBe("mateka");
            expect(data[0].tags[0].tag.name).toBe("test tag");
            expect(data[0].languages[0].language.name).toBe("test language");
        });
        test('should return with correct limits and offsets', async () => {
            const { cookies } = await registerAndLogin(client)
            for (let i = 0; i < 80; ++i) {
                await publisTestQuiz(client, cookies, i);
            }

            const quizzes = await client.quizzes.$get({ query: {} }, { headers: { cookie: cookies.join(';') } });
            const quizzes50 = await client.quizzes.$get({ query: { limit: '50' } }, { headers: { cookie: cookies.join(';') } });
            const quizzes501 = await client.quizzes.$get({ query: { limit: '50', page: '2' } }, { headers: { cookie: cookies.join(';') } });

            const { data } = await quizzes.json();
            const data50 = (await quizzes50.json()).data;

            expect(quizzes.status).toBe(200);
            expect(data.length).toBe(20);
            expect(quizzes50.status).toBe(200);
            expect(data50.length).toBe(50);
            expect(quizzes501.status).toBe(200);
            expect((await quizzes501.json()).data.length).toBe(30);

        });
        test('should not return quizzes that are not of published status', async () => {
            const { cookies } = await registerAndLogin(client)

            const post = await publisTestQuiz(client, cookies, 0, "draft");
            expect(post.status).toBe(201);

            const post1 = await publisTestQuiz(client, cookies, 1, "requires_review");
            expect(post1.status).toBe(201);

            const post2 = await publisTestQuiz(client, cookies, 2, "private");
            expect(post2.status).toBe(201);

            const quizzes = await client.quizzes.$get({ query: {} }, { headers: { cookie: cookies.join(';') } });
            expect(quizzes.status).toBe(200);

            const { data } = await quizzes.json();

            expect(data.length).toBe(0);
        });
    });
});
