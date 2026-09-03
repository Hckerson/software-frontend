import AuthCard from "@/components/layout/auth-card";
import RegisterForm from "@/components/sections/auth/register-form";

export const metadata = { title: "Create account · Meter" };

export default function RegisterPage() {
    return (
        <AuthCard
            title="Create your account"
            description="Pick a plan straight after signing up."
        >
            <RegisterForm />
        </AuthCard>
    );
}
