import { Hono } from "hono";
import { z } from "zod";
import { zv } from "@/middlewares/zv";
import verifyHandler from "@/controllers/auth/verify";
import registerHandler from "@/controllers/auth/register";
import loginHandler from "@/controllers/auth/login";
import logoutHandler from "@/controllers/auth/logout";
import checkJwt from "@/middlewares/check-jwt";
import forgotPasswordHandler from "@/controllers/auth/forgot-password";
import forgotPassActivateHandler from "@/controllers/auth/forgot-password-activate";
import changePasswordHandler from "@/controllers/auth/change-password";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";

const registerDesc = describeRoute({
    description: "Register user account",
    responses: {
        200: {
            description: "Success - user created",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({ message: z.string() })
                    )
                }
            },
        },
        400: {
            description: "Bad Request - user not created",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({
                            message: z.string(),
                            error: z.object({
                                message: z.string(),
                                case: z.enum(["auth", "server"])
                            })
                        })
                    )
                }
            },
        }
    }
})

const loginDesc = describeRoute({
    description: "Login user account",
    responses: {
        200: {
            description: "Success - login successful",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({ message: z.string() })
                    )
                }
            },
        },
        400: {
            description: "Bad Request - login failed",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({
                            message: z.string(),
                            error: z.object({
                                message: z.string(),
                                case: z.enum(["conflict", "bad_request"])
                            })
                        })
                    )
                }
            },
        },
        401: {
            description: "Unauthorized - account not verified or blocked",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({
                            message: z.string(),
                            error: z.object({
                                message: z.string(),
                                case: z.literal("auth"),
                                field: z.literal("auth_status")
                            })
                        })
                    )
                }
            },
        }
    }
});

const logoutDesc = describeRoute({
    description: "Logout user",
    responses: {
        200: {
            description: "Success - user logged out",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({ message: z.string() })
                    )
                }
            },
        }
    }
});

const forgotPasswordDesc = describeRoute({
    description: "Request password reset",
    responses: {
        200: {
            description: "Success - password reset email sent if account exists",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({ message: z.string() })
                    )
                }
            },
        }
    }
});

const changePasswordDesc = describeRoute({
    description: "Change user password",
    responses: {
        200: {
            description: "Success - password changed",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({ message: z.string() })
                    )
                }
            },
        },
        401: {
            description: "Unauthorized - invalid old password",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({
                            message: z.string(),
                            error: z.object({
                                message: z.literal("invalid_old_password"),
                                case: z.literal("unauthorized")
                            })
                        })
                    )
                }
            },
        }
    }
});

const forgotPassActivateDesc = describeRoute({
    description: "Activate temporary password using reset token",
    responses: {
        200: {
            description: "Success - temporary password assigned",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({ message: z.string() })
                    )
                }
            },
        },
        400: {
            description: "Bad Request - invalid or expired token",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({
                            message: z.literal("invalid"),
                            error: z.object({
                                message: z.literal("invalid"),
                                case: z.literal("server")
                            })
                        })
                    )
                }
            },
        }
    }
});

const verifyDesc = describeRoute({
    description: "Verify user account using email token",
    responses: {
        200: {
            description: "Success - user verified",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({ message: z.string() })
                    )
                }
            },
        },
        400: {
            description: "Bad Request - invalid or expired verification token",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({
                            message: z.literal("invalid"),
                            error: z.object({
                                message: z.literal("invalid"),
                                case: z.literal("server")
                            })
                        })
                    )
                }
            },
        }
    }
});

const authedDesc = describeRoute({
    description: "Check if user is authenticated",
    responses: {
        200: {
            description: "Success - user is authenticated",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({ message: z.literal("user is authed") })
                    )
                }
            },
        },
        401: {
            description: "Unauthorized - user is not authenticated",
            content: {
                "application/json": {
                    schema: resolver(
                        z.object({
                            message: z.string(),
                            error: z.object({
                                message: z.string(),
                                case: z.literal("unauthorized")
                            })
                        })
                    )
                }
            },
        }
    }
});
const auth = new Hono().basePath("/auth")
    .post("/register", registerDesc, ...registerHandler)
    .post("/login", loginDesc, ...loginHandler)
    .get("/logout", logoutDesc, ...logoutHandler)
    .post("/forgotpassword", forgotPasswordDesc, ...forgotPasswordHandler)
    .post("/changepassword", changePasswordDesc, ...changePasswordHandler)
    .get("/forgotpassactivate/:token", forgotPassActivateDesc, ...forgotPassActivateHandler)
    .get("/verify/:emailHash", verifyDesc, ...verifyHandler)
    .get("/authed", authedDesc, zv('query', z.object({ role: z.string().optional() })), async (c) => {
        // TEST: test this (also this is a bit of a mess)
        const { role } = c.req.valid('query');
        const middleware = checkJwt(role)

        // @ts-ignore not sending in next
        const res = await middleware(c)

        if (!res) return c.json({ message: "user is authed" }, 200);
        else return res;
    })

export default auth;
