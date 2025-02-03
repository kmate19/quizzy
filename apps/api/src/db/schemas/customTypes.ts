import { customType } from "drizzle-orm/pg-core";

// not builtin to drizzle yet
export const bytea = customType<{ data: Buffer, driverData: Buffer, default: false }>(
    {
        dataType() {
            return 'bytea';
        }
    }
);


