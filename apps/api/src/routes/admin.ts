import setQuizStatusHandlers from "@/controllers/admin/set-quiz-status";
import getAllUsersHandlers from "@/controllers/admin/get-all-users";
import setAuthStatusHandlers from "@/controllers/admin/set-auth-status";
import getAllQuizHandlers from "@/controllers/admin/get-all-quiz";
import setRoleHandlers from "@/controllers/admin/set-role";
import check_apikey from "@/middlewares/check-apikey";
import { Hono } from "hono/tiny";

const admin = new Hono()
    .basePath("/admin")
    .post("/set/role", ...setRoleHandlers)
    .post("/set/authstatus", ...setAuthStatusHandlers)
    .post("/set/quiz", ...setQuizStatusHandlers)
    .post("/all-quizzes", ...getAllQuizHandlers)
    .get("/all-users", ...getAllUsersHandlers)
    .get("/authenticate", async (c) => {
        // @ts-expect-error not passing next
        const res = await check_apikey(c);

        if (res) {
            c.res = res;
            return c.res.clone();
        }

        return c.json({ message: "Authenticated" }, 200);
    });

export default admin;
