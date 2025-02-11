import { sql } from "drizzle-orm";
import { customType } from "drizzle-orm/pg-core";

// not builtin to drizzle yet
export const bytea = customType<{ data: Buffer, driverData: string, default: false }>(
    {
        dataType() {
            return 'text';
        },
        toDriver(value) {
            return sql`encode(${value}, 'hex')`;
        },
        fromDriver(value) {
            return Buffer.from(value, 'hex');
        }
    }
);


