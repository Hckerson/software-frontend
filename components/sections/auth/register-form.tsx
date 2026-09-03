"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/button";
import FormField from "@/components/common/form-field";
import ErrorState from "@/components/common/error-state";
import { useRegister } from "@/lib/hooks/use-auth";
import { signupSchema } from "@/lib/validations/auth";
import { validate } from "@/lib/utils/form-errors";
import type { FieldErrors } from "@/lib/utils/form-errors";
import type { FormEvent } from "react";

const AFTER_SIGNUP = "/plans";

export default function RegisterForm() {
    const router = useRouter();
    const register = useRegister();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<FieldErrors>({});

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();

        const result = validate(signupSchema, {
            fullName,
            email,
            password,
            confirmPassword,
        });

        if (result.errors) {
            setErrors(result.errors);
            return;
        }

        setErrors({});
        register.mutate(
            { fullName, email, password },
            {
                onSuccess: () => {
                    router.replace(AFTER_SIGNUP);
                    router.refresh();
                },
            },
        );
    };

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <FormField
                label="Full name"
                autoComplete="name"
                value={fullName}
                onChange={setFullName}
                error={errors.fullName}
                required
            />
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
                autoComplete="new-password"
                value={password}
                onChange={setPassword}
                error={errors.password}
                required
            />
            <FormField
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                error={errors.confirmPassword}
                required
            />

            {register.isError && <ErrorState error={register.error} />}

            <Button type="submit" size="lg" isLoading={register.isPending}>
                Create account
            </Button>

            <p className="text-text-secondary text-center text-xs">
                {"Already have an account? "}
                <Link href="/auth/login" className="text-accent">
                    Sign in
                </Link>
            </p>
        </form>
    );
}
