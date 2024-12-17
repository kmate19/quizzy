import { hc } from 'hono/client';
import type { AppType } from "@repo/api"
// example

const clientv1 = hc<AppType>("http://localhost:3000").api.v1;

const a = clientv1.protected.$get();

console.log(a);

