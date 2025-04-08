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
    ACCESS_COOKIE_NAME: () =>
        assertEnvProd(Bun.env.ACCESS_COOKIE_NAME, "ACCESS_COOKIE_NAME"),
    ACCESS_JWT_SECRET: () =>
        assertEnvProd(Bun.env.ACCESS_JWT_SECRET, "ACCESS_JWT_SECRET"),
    WS_SECRET: () => assertEnvProd(Bun.env.WS_SECRET, "WS_SECRET"),
} as const;

verify();

export default ENV;
