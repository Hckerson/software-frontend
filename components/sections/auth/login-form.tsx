"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/common/button";
import FormField from "@/components/common/form-field";
import ErrorState from "@/components/common/error-state";
import { useLogin } from "@/lib/hooks/use-auth";
import { loginSchema } from "@/lib/validations/auth";
import { validate } from "@/lib/utils/form-errors";
import { HOME_PATH, REDIRECT_PARAM } from "@/lib/constants";
import type { FieldErrors } from "@/lib/utils/form-errors";
import type { FormEvent } from "react";

export default function LoginForm() {
    const router = useRouter();
    const params = useSearchParams();
    const login = useLogin();
    const destination = params.get(REDIRECT_PARAM) ?? HOME_PATH;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<FieldErrors>({});

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();

        const result = validate(loginSchema, { email, password });

        if (result.errors) {
            setErrors(result.errors);
            return;
        }

        setErrors({});
        login.mutate(result.values, {
            onSuccess: () => {
                router.replace(destination);
                router.refresh();
            },
        });
    };

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
            <FormField
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={setPassword}
                error={errors.password}
                required
            />

            {login.isError && <ErrorState error={login.error} />}

            <Button type="submit" size="lg" isLoading={login.isPending}>
                Sign in
            </Button>

            <p className="text-text-secondary text-center text-xs">
                {"No account yet? "}
                <Link href="/auth/register" className="text-accent">
                    Create one
                </Link>
            </p>
            <Link
                href="/auth/forgot-password"
                className="text-text-muted text-center text-xs"
            >
                Forgot your password?
            </Link>
        </form>
    );
}
