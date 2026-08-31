import { Suspense } from "react";
import AuthCard from "@/components/layout/auth-card";
import Skeleton from "@/components/common/skeleton";
import ResetPasswordForm from "@/components/sections/auth/reset-password-form";

export const metadata = { title: "New password · Meter" };

export default function ResetPasswordPage() {
    return (
        <AuthCard
            title="Set a new password"
            description="Choose a password of at least eight characters."
        >
            <Suspense fallback={<Skeleton lines={4} />}>
                <ResetPasswordForm />
            </Suspense>
        </AuthCard>
    );
}
