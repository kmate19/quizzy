import { hcWithType } from "@repo/api/hc"
import { wsHcWithType } from "@repo/websocket/hc";

// TODO: change domain in prod
export const clientv1 = hcWithType("http://localhost:5173/").api.v1;

export const wsclient = wsHcWithType("http://localhost:5173/").ws;

