import { hcWithType } from "@repo/api/hc"
import { wsHcWithType } from "@repo/websocket/hc";

// TODO: change domain in prod
export const clientv1 = hcWithType("/").api.v1;

export const wsclient = wsHcWithType("/").ws;

