import { hc } from 'hono/client';
import type { ApiType } from "@repo/api"

// TODO: change domain in prod
export const clientv1 = hc<ApiType>("/").api.v1;
