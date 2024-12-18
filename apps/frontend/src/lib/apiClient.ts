import { hc } from 'hono/client';
import type { AppType } from "@repo/api"

// TODO: change domain in prod
export const clientv1 = hc<AppType>("http://localhost:3000").api.v1;
