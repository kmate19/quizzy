function assertEnvProd<T>(env: T | undefined, name: string): T | undefined {
    env = env === "" ? undefined : env;
    if (env === undefined && Bun.env.NODE_ENV === "production") {
        throw new Error(name + " is not defined in the environment and this is a production environment!");
    }
    if (env === undefined) {
        console.error(`WARN: ${name} is not defined in the environment, using default value!`);
    }
    return env;
}

function verify() {
    if (Bun.env.NODE_ENV !== "production") console.error("WARN: Running in development mode!");
    for (const key in ENV) {
        ENV[key as keyof typeof ENV]();
    }
}

const ENV = {
    NODE_ENV: () => assertEnvProd(Bun.env.NODE_ENV, "NODE_ENV") || "development",
    EMAIL_USER: () => assertEnvProd(Bun.env.EMAIL_USER, "EMAIL_USER") || "",
    EMAIL_PASS: () => assertEnvProd(Bun.env.EMAIL_PASS, "EMAIL_PASS") || "",
    DOMAIN: () => assertEnvProd(Bun.env.DOMAIN, "DOMAIN") || "localhost",
    REFRESH_JWT_SECRET: () => assertEnvProd(Bun.env.REFRESH_JWT_SECRET, "REFRESH_JWT_SECRET") || "asd",
    ACCESS_JWT_SECRET: () => assertEnvProd(Bun.env.ACCESS_JWT_SECRET, "ACCESS_JWT_SECRET") || "asdf",
    DATABASE_URL: () => assertEnvProd(Bun.env.DATABASE_URL, "DATABASE_URL") || "postgres://postgres:mypassword@localhost:5432/postgres",
} as const;

verify();

export default ENV;
