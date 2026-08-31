"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/common/button";
import FormField from "@/components/common/form-field";
import ErrorState from "@/components/common/error-state";
import { useResetPassword } from "@/lib/hooks/use-auth";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { validate } from "@/lib/utils/form-errors";
import { LOGIN_PATH } from "@/lib/constants";
import type { FieldErrors } from "@/lib/utils/form-errors";
import type { FormEvent } from "react";

export default function ResetPasswordForm() {
    const router = useRouter();
    const params = useSearchParams();
    const reset = useResetPassword();
    const token = params.get("token") ?? "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<FieldErrors>({});

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();

        const result = validate(resetPasswordSchema, {
            token,
            password,
            confirmPassword,
        });

        if (result.errors) {
            setErrors(result.errors);
            return;
        }

        setErrors({});
        reset.mutate(
            { token, password },
            { onSuccess: () => router.replace(LOGIN_PATH) },
        );
    };

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
            {errors.token && (
                <p className="text-error text-xs">
                    This reset link is missing its token. Request a new one.
                </p>
            )}
            <FormField
                label="New password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={setPassword}
                error={errors.password}
                required
            />
            <FormField
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                error={errors.confirmPassword}
                required
            />

            {reset.isError && <ErrorState error={reset.error} />}

            <Button type="submit" size="lg" isLoading={reset.isPending}>
                Set new password
            </Button>

            <Link
                href="/auth/forgot-password"
                className="text-text-muted text-center text-xs"
            >
                Request a new link
            </Link>
        </form>
    );
}
