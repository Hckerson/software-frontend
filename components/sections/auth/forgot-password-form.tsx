"use client";
import Link from "next/link";
import { useState } from "react";
import Button from "@/components/common/button";
import FormField from "@/components/common/form-field";
import ErrorState from "@/components/common/error-state";
import { useForgotPassword } from "@/lib/hooks/use-auth";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { validate } from "@/lib/utils/form-errors";
import type { FieldErrors } from "@/lib/utils/form-errors";
import type { FormEvent } from "react";

export default function ForgotPasswordForm() {
    const forgot = useForgotPassword();
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<FieldErrors>({});

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();

        const result = validate(forgotPasswordSchema, { email });

        if (result.errors) {
            setErrors(result.errors);
            return;
        }

        setErrors({});
        forgot.mutate(result.values);
    };

    if (forgot.isSuccess) {
        return (
            <div className="flex flex-col gap-3">
                <p className="text-text text-sm">
                    If an account exists for that address, a reset link is on
                    its way.
                </p>
                <Link href="/auth/login" className="text-accent text-xs">
                    Back to sign in
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <FormField
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={setEmail}
                error={errors.email}
                required
            />

            {forgot.isError && <ErrorState error={forgot.error} />}

            <Button type="submit" size="lg" isLoading={forgot.isPending}>
                Send reset link
            </Button>

            <Link
                href="/auth/login"
                className="text-text-muted text-center text-xs"
            >
                Back to sign in
            </Link>
        </form>
    );
}
