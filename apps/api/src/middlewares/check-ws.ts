import ENV from "@/config/env";
import { bearerAuth } from "hono/bearer-auth";

const check_ws = bearerAuth({ token: ENV.WS_SECRET() });
export default check_ws;
