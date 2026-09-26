import { z } from "zod";

const password = z.string().min(8, "Password must be at least 8 characters");

export const loginSchema = z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
    .object({
        fullName: z.string().min(3, "Full name must be at least 3 characters"),
        email: z.string().email("Enter a valid email address"),
        password,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const forgotPasswordSchema = z.object({
    email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z
    .object({
        token: z.string().min(1, "Reset token is required"),
        password,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
