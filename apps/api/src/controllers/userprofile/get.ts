import GLOBALS from "@/config/globals";
import db from "@/db";
import { usersTable } from "@/db/schemas";
import checkJwt from "@/middlewares/check-jwt";
import { eq } from "drizzle-orm";
import { ApiResponse } from "repo";

const getBaseDataHandler = GLOBALS.CONTROLLER_FACTORY(checkJwt(), async (c) => {
    const { userId } = c.get("accessTokenPayload");

    const userData = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, userId),
        columns: {
            email: true,
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
            sentFriendships: {
                columns: {
                    created_at: true,
                    status: true,
                },
                with: {
                    addressee: {
                        columns: {
                            id: true,
                            username: true,
                            activity_status: true,
                            profile_picture: true,
                        },
                    },
                },
            },
            recievedFriendships: {
                columns: {
                    created_at: true,
                    status: true,
                },
                with: {
                    requester: {
                        columns: {
                            id: true,
                            username: true,
                            activity_status: true,
                            profile_picture: true,
                        },
                    },
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
            message: "User not found",
            error: {
                message: "User not found",
                case: "not_found",
            },
        } satisfies ApiResponse;
        return c.json(res, 404);
    }

    const res = {
        message: "Success",
        data: userData,
    } satisfies ApiResponse;

    return c.json(res, 200);
});

export default getBaseDataHandler;
