import PageHeader from "@/components/common/page-header";
import ProfileForm from "@/components/sections/settings/profile-form";
import AccountDetails from "@/components/sections/settings/account-details";
import PaymentMethods from "@/components/sections/settings/payment-methods";

export const metadata = { title: "Settings · Meter" };

export default function SettingsPage() {
    return (
        <>
            <PageHeader
                title="Settings"
                description="Your profile and account details."
            />
            <div className="split-grid">
                <ProfileForm />
                <AccountDetails />
            </div>
            <PaymentMethods />
        </>
    );
}
