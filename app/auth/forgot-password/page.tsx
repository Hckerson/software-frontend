import AuthCard from "@/components/layout/auth-card";
import ForgotPasswordForm from "@/components/sections/auth/forgot-password-form";

export const metadata = { title: "Reset password · Meter" };

export default function ForgotPasswordPage() {
    return (
        <AuthCard
            title="Forgot your password"
            description="We will email you a link to set a new one."
        >
            <ForgotPasswordForm />
        </AuthCard>
    );
}
