import { hono } from '@/index'

import { hc } from 'hono/client'

// this is a trick to calculate the type when compiling
const client = hc<typeof hono>('')
export type Client = typeof client

export const wsHcWithType = (...args: Parameters<typeof hc>): Client =>
    hc<typeof hono>(...args)
