import { Suspense } from "react";
import AuthCard from "@/components/layout/auth-card";
import Skeleton from "@/components/common/skeleton";
import LoginForm from "@/components/sections/auth/login-form";

export const metadata = { title: "Sign in · Meter" };

export default function LoginPage() {
    return (
        <AuthCard
            title="Sign in"
            description="Access your subscription, usage and invoices."
        >
            <Suspense fallback={<Skeleton lines={4} />}>
                <LoginForm />
            </Suspense>
        </AuthCard>
    );
}
