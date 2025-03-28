// ./src/openapi/auth-openapi.ts

import { ApiResponseSchema } from "@/utils/schemas/zod-schemas";
import { LoginUserSchema, RegisterUserSchema } from "@/db/schemas";
import { changePasswordSchema } from "@/utils/schemas/zod-schemas";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";

export const registerDesc = describeRoute({
    tags: ["Authentication"],
    description: "Register a new user account. Sends a verification email.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: resolver(RegisterUserSchema),
                },
            },
            description: "User registration details.",
            required: true,
        },
    },
    responses: {
        200: {
            description: "Success - User created, verification email sent.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description:
                "Bad Request - User not created due to validation errors (e.g., invalid email format, weak password) or duplicate username/email.",
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
    tags: ["Authentication"],
    description:
        "Login a user using username/email and password. Sets an HTTP-only access cookie upon success.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: resolver(LoginUserSchema),
                },
            },
            description: "User login credentials.",
            required: true,
        },
    },
    responses: {
        200: {
            description: "Success - Login successful, access cookie set.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description:
                "Bad Request - Login failed due to invalid credentials or if the user already has an active login cookie.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        401: {
            description:
                "Unauthorized - Account is not verified ('pending') or is 'blocked'.",
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
    tags: ["Authentication"],
    description:
        "Logout the currently authenticated user by invalidating their refresh token and removing the access cookie. Requires a valid access cookie.",
    responses: {
        200: {
            description: "Success - User logged out, access cookie cleared.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        401: {
            description:
                "Unauthorized - User is not logged in (no valid access cookie).",
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

export const forgotPasswordDesc = describeRoute({
    tags: ["Authentication"],
    description:
        "Request a password reset email. If the provided username or email exists, an email is sent containing a link to activate a temporary password.",
    request: {
        body: {
            content: {
                "application/json": {
                    // Using LoginUserSchema but only username_or_email is relevant
                    schema: resolver(
                        LoginUserSchema.pick({ username_or_email: true })
                    ),
                },
            },
            description:
                "The username or email of the account to reset password for.",
            required: true,
        },
    },
    responses: {
        200: {
            description:
                "Success - If the account exists, a password reset email has been dispatched. (The response is the same whether the account exists or not to prevent user enumeration).",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description: "Bad Request - Invalid input format.",
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

export const changePasswordDesc = describeRoute({
    tags: ["Authentication"],
    description:
        "Change the authenticated user's password. Requires the current (old) password and the new password. Requires a valid access cookie.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: resolver(changePasswordSchema),
                },
            },
            description: "Old and new password details.",
            required: true,
        },
    },
    responses: {
        200: {
            description: "Success - Password changed successfully.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        401: {
            description:
                "Unauthorized - Invalid old password provided or user is not logged in.",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        400: {
            description: "Bad Request - Invalid input format for new password.",
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
    tags: ["Authentication"],
    description:
        "Activate the temporary password using the token sent via the forgot password email. This changes the user's password to the temporary one.",
    request: {
        params: {
            type: "object",
            properties: {
                token: {
                    type: "string",
                    description: "The password reset token from the email.",
                },
            },
            required: ["token"],
        },
    },
    responses: {
        200: {
            description:
                "Success - Temporary password assigned. The user should now log in with the temporary password and change it.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description:
                "Bad Request - The provided token is invalid or has expired.",
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
    tags: ["Authentication"],
    description:
        "Verify the user's account using the verification token sent via email upon registration. Sets the user's status to 'active'.",
    request: {
        params: {
            type: "object",
            properties: {
                emailHash: {
                    type: "string",
                    description: "The email verification token from the email.",
                },
            },
            required: ["emailHash"],
        },
    },
    responses: {
        200: {
            description: "Success - User account verified successfully.",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        400: {
            description:
                "Bad Request - The provided verification token is invalid or has expired.",
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
    tags: ["Authentication"],
    description:
        "Check if the user is currently authenticated via access cookie. Optionally, check if the user has a specific role.",
    request: {
        query: {
            type: "object",
            properties: {
                role: {
                    type: "string",
                    description:
                        "Optional role name to check if the user possesses.",
                    example: "admin",
                },
            },
        },
    },
    responses: {
        200: {
            description:
                "Success - User is authenticated (and has the specified role, if provided).",
            content: {
                "application/json": {
                    schema: resolver(ApiResponseSchema),
                },
            },
        },
        401: {
            description:
                "Unauthorized - User is not logged in (no valid access cookie or expired token).",
            content: {
                "application/json": {
                    schema: resolver(
                        ApiResponseSchema.required({ error: true })
                    ),
                },
            },
        },
        403: {
            description:
                "Forbidden - User is authenticated but does not have the required role specified in the query parameter.",
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
