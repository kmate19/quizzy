import { createMiddleware } from "hono/factory";
import check_apikey from "./check-apikey";
import checkJwt from "./check-jwt";

// TODO: ehhhhhhhhhhhhh
export const apikey_or_jwt = (role?: string) => {
    return createMiddleware(async (c, next) => {
        const middlewareStatuses = {
            apikey: {
                status: true,
                response: {},
            },
            jwt: {
                status: true,
                response: {},
            },
        };

        // @ts-expect-error we need to call without next
        const apikeyMiddleware = await check_apikey(c);

        console.log("apikeyMiddleware", apikeyMiddleware);

        if (apikeyMiddleware) {
            middlewareStatuses.apikey.status = false;
            middlewareStatuses.apikey.response = apikeyMiddleware;
        }

        // @ts-expect-error we need to call without next
        const jwtMiddleware = await checkJwt(role)(c);

        if (jwtMiddleware) {
            middlewareStatuses.jwt.status = false;
            middlewareStatuses.jwt.response = jwtMiddleware;
        }

        const somePassed = Object.values(middlewareStatuses).some(
            (middleware) => middleware.status
        );

        console.log(somePassed);

        if (somePassed) {
            await next();
        } else {
            const res = middlewareStatuses.jwt.response as Response;
            c.res = res;
            return c.res.clone();
        }
    });
};
