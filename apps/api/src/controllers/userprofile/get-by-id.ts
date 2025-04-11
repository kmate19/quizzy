import GLOBALS from "@/config/globals";
import db from "@/db";
import { usersTable } from "@/db/schemas";
import { apikey_or_jwt } from "@/middlewares/check-composite";
import { zv } from "@/middlewares/zv";
import { eq } from "drizzle-orm";
import { ApiResponse } from "repo";
import { z } from "zod";

const getProfileByIdHandler = GLOBALS.CONTROLLER_FACTORY(
    apikey_or_jwt(),
    zv("param", z.object({ userId: z.string().uuid() })),
    async (c) => {
        const { userId } = c.req.valid("param");

        const userData = await db.query.usersTable.findFirst({
            where: eq(usersTable.id, userId),
            columns: {
                username: true,
                created_at: true,
                activity_status: true,
                profile_picture: true,
            },
            with: {
                stats: {
                    columns: {
                        plays: true,
                        first_places: true,
                        second_places: true,
                        third_places: true,
                        correct_answers: true,
                        wrong_answers: true,
                    },
                },
                roles: {
                    columns: {},
                    with: {
                        role: {
                            columns: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!userData) {
            const res = {
                message: "Felhasználó nem található",
                error: {
                    message: "User not found",
                    case: "not_found",
                },
            } satisfies ApiResponse;
            return c.json(res, 404);
        }

        const res = {
            message: "Sikeres",
            data: userData,
        } satisfies ApiResponse;

        return c.json(res, 200);
    }
);

export default getProfileByIdHandler;
