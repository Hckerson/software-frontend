import { useMutation, useQueryClient } from "@tanstack/react-query";
import { query } from "@/lib/api-client";
import { routes } from "@/lib/contract/routes";
import type {
    ForgotPasswordDto,
    LoginDto,
    RegisterDto,
    ResetPasswordDto,
} from "@/lib/contract/schemas";
import type { AuthResult } from "@/lib/types";

export const useLogin = () => {
    const client = useQueryClient();

    return useMutation({
        mutationFn: (input: LoginDto) =>
            query.post<AuthResult>(routes.authLogin(), input),
        onSuccess: () => client.clear(),
    });
};

export const useRegister = () => {
    const client = useQueryClient();

    return useMutation({
        mutationFn: (input: RegisterDto) =>
            query.post<AuthResult>(routes.authRegister(), input),
        onSuccess: () => client.clear(),
    });
};

export const useLogout = () => {
    const client = useQueryClient();

    return useMutation({
        mutationFn: () =>
            query.post<{ message: string }>(routes.authLogout(), {}),
        onSettled: () => client.clear(),
    });
};

export const useForgotPassword = () =>
    useMutation({
        mutationFn: (input: ForgotPasswordDto) =>
            query.post<{ message: string }>(routes.authForgotPassword(), input),
    });

export const useResetPassword = () =>
    useMutation({
        mutationFn: (input: ResetPasswordDto) =>
            query.post<{ message: string }>(routes.authResetPassword(), input),
    });
