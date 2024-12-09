function assertEnv<T>(env: T | undefined, name: string): T {
    if (env === undefined) {
        throw new Error(name + " is not defined in the environment and has no default value!");
    }
    return env;
}

function assertEnvProd<T>(env: T | undefined, name: string): T | undefined {
    if (env === undefined && Bun.env.NODE_ENV === "production") {
        throw new Error(name + " is not defined in the environment and this is a production environment!");
    }
    return env;
}

const ENV = {
    NODE_ENV: () => assertEnv(Bun.env.NODE_ENV, "NODE_ENV"),
    EMAIL_USER: () => assertEnv(Bun.env.EMAIL_USER, "EMAIL_USER"),
    EMAIL_PASS: () => assertEnv(Bun.env.EMAIL_PASS, "EMAIL_PASS"),
    DOMAIN: () => assertEnvProd(Bun.env.DOMAIN, "DOMAIN") || "localhost",
    REFRESH_JWT_SECRET: () => assertEnvProd(Bun.env.REFRESH_JWT_SECRET, "REFRESH_JWT_SECRET") || "asd",
    ACCESS_JWT_SECRET: () => assertEnvProd(Bun.env.ACCESS_JWT_SECRET, "ACCESS_JWT_SECRET") || "asdf",
    DATABASE_URL: () => assertEnvProd(Bun.env.DATABASE_URL, "DATABASE_URL") || "postgres://postgres:mypassword@localhost:5432/postgres",
} as const;


export default ENV;
