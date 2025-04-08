import { hcWithType } from '@repo/api/hc'
import { wsHcWithType } from '@repo/websocket/hc'

// TODO: change domain in prod

const domain = import.meta.env.VITE_API_URL || 'http://localhost:5173/'

export const clientv1 = hcWithType(domain).api.v1

export const wsclient = wsHcWithType(domain).ws
