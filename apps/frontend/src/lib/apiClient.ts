import { hcWithType } from "@repo/api/hc"

// TODO: change domain in prod
export const clientv1 = hcWithType("/").api.v1;
