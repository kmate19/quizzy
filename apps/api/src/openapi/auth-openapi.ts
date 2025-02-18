import { ApiResponseSchema } from "@/utils/schemas/zod-schemas";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";

export const registerDesc = describeRoute({
    description: "Register user account",
    responses: {
        200: {
            description: "Success - user created",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description: "Bad Request - user not created",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
    },
});

export const loginDesc = describeRoute({
    description: "Login user account",
    responses: {
        200: {
            description: "Success - login successful",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description: "Bad Request - login failed",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        401: {
            description: "Unauthorized - account not verified or blocked",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
    },
});

export const logoutDesc = describeRoute({
    description: "Logout user",
    responses: {
        200: {
            description: "Success - user logged out",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
    },
});

export const forgotPasswordDesc = describeRoute({
    description: "Request password reset",
    responses: {
        200: {
            description:
                "Success - password reset email sent if account exists",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
    },
});

export const changePasswordDesc = describeRoute({
    description: "Change user password",
    responses: {
        200: {
            description: "Success - password changed",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        401: {
            description: "Unauthorized - invalid old password",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
    },
});

export const forgotPassActivateDesc = describeRoute({
    description: "Activate temporary password using reset token",
    responses: {
        200: {
            description: "Success - temporary password assigned",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description: "Bad Request - invalid or expired token",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
    },
});

export const verifyDesc = describeRoute({
    description: "Verify user account using email token",
    responses: {
        200: {
            description: "Success - user verified",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description: "Bad Request - invalid or expired verification token",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
    },
});

export const authedDesc = describeRoute({
    description: "Check if user is authenticated",
    responses: {
        200: {
            description: "Success - user is authenticated",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        401: {
            description: "Unauthorized - user is not authenticated",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
    },
});
