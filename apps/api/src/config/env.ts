function assertEnvProd(
    env: string | undefined,
    name: string,
    defval: string = "asd"
): string {
    env = env === "" ? undefined : env;
    if (env === undefined && Bun.env.NODE_ENV === "production") {
        throw new Error(
            name +
                " is not defined in the environment and this is a production environment!"
        );
    }
    if (env === undefined) {
        if (defval === "") {
            throw new Error(
                name +
                    " is not defined in the environment and has no default value!"
            );
        }
        console.error(
            `W: ${name} is not defined in the environment, using default value: "${defval}" !`
        );
        env = defval;
    }
    return env;
}

function verify() {
    if (Bun.env.NODE_ENV !== "production") {
        console.error("W: Running in development mode!");
    }
    for (const key in ENV) {
        ENV[key as keyof typeof ENV]();
    }
}

const ENV = {
    NODE_ENV: () => assertEnvProd(Bun.env.NODE_ENV, "NODE_ENV", "development"),
    MAILGUN_API_KEY: () =>
        assertEnvProd(Bun.env.MAILGUN_API_KEY, "MAILGUN_API_KEY"),
    EMAIL_USER: () => assertEnvProd(Bun.env.EMAIL_USER, "EMAIL_USER"),
    EMAIL_PASS: () => assertEnvProd(Bun.env.EMAIL_PASS, "EMAIL_PASS"),
    ACCESS_COOKIE_NAME: () =>
        assertEnvProd(Bun.env.ACCESS_COOKIE_NAME, "ACCESS_COOKIE_NAME"),
    DOMAIN: () => assertEnvProd(Bun.env.DOMAIN, "DOMAIN", "localhost"),
    REFRESH_JWT_SECRET: () =>
        assertEnvProd(Bun.env.REFRESH_JWT_SECRET, "REFRESH_JWT_SECRET"),
    ACCESS_JWT_SECRET: () =>
        assertEnvProd(Bun.env.ACCESS_JWT_SECRET, "ACCESS_JWT_SECRET"),
    DATABASE_URL: () =>
        assertEnvProd(
            Bun.env.DATABASE_URL,
            "DATABASE_URL",
            "postgres://postgres:mypassword@localhost:5432/postgres"
        ),
    WS_SECRET: () => assertEnvProd(Bun.env.WS_SECRET, "WS_SECRET"),
} as const;

verify();

export default ENV;
