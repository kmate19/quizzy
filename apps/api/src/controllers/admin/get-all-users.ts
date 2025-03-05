import GLOBALS from "@/config/globals";
import db from "@/db";
import check_apikey from "@/middlewares/check-apikey";
import { zv } from "@/middlewares/zv";
import { paginationSchema } from "@/utils/schemas/zod-schemas";
import { sql } from "drizzle-orm";
import { ApiResponse } from "repo";

const getAllUsersHandlers = GLOBALS.CONTROLLER_FACTORY(
    check_apikey,
    zv("query", paginationSchema),
    async (c) => {
        const limit = c.req.valid("query").limit || 20;
        const page = c.req.valid("query").page || 1;

        const offset = limit * (page - 1);

        const usersWCount = await db.query.usersTable.findMany({
            extras: {
                totalCount: sql<number>`COUNT(*) OVER()`.as("total_count"),
            },
            columns: {
                id: true,
                username: true,
                email: true,
                activity_status: true,
                profile_picture: true,
                auth_status: true,
                created_at: true,
                updated_at: true,
            },
            offset,
            limit,
            with: {
                stats: true,
                tokens: true,
                reviews: true,
                api_keys: true,
                roles: {
                    columns: {},
                    with: {
                        role: true,
                    },
                },
            },
        });

        const totalCount = usersWCount[0]?.totalCount || 0;

        // eslint-disable-next-line
        const users = usersWCount.map(({ totalCount, ...rest }) => rest);

        const res = {
            message: "Users fetched",
            data: { users, totalCount },
        } satisfies ApiResponse;

        return c.json(res, 200);
    }
);

export default getAllUsersHandlers;
