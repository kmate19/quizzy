import { app } from '@/index';
import { beforeEach, describe, test, expect } from 'bun:test'
import { testClient } from 'hono/testing';
import { registerAndLogin } from './utils/helper';
import { reset } from 'drizzle-seed';
import db from '@/db';
import * as schema from "@/db/schemas/index";
import GLOBALS from '@/config/globals';
import { smallBase64Img } from './utils/constants';

const client = testClient(app).api.v1;

beforeEach(async () => {
    await reset(db, schema);
    for (let i = 0; i < GLOBALS.DB_ROLES.length; i++) {
        await db.insert(schema.rolesTable).values(GLOBALS.DB_ROLES[i]).onConflictDoNothing()
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
            }]
        }
    }, { headers: { cookie: cookies.join(';') } });
}

describe('quiz related routes', async () => {
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
            expect(data[0].user.username).toBe("mateka");
            expect(data[0].description).toBe("test quiz description");
        });
        test('should return with correct limits and offsets', async () => {
            const { cookies } = await registerAndLogin(client)
            for (let i = 0; i < 80; ++i) {
                const post = await publisTestQuiz(client, cookies, i);
                expect(post.status).toBe(201);
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
