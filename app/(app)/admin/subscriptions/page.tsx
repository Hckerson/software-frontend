import PageHeader from "@/components/common/page-header";
import AdminSubscriptionList from "@/components/sections/admin/admin-subscription-list";

export const metadata = { title: "Subscriptions · Meter" };

export default function AdminSubscriptionsPage() {
    return (
        <>
            <PageHeader
                title="Subscriptions"
                description="Every subscription on the platform, filterable by status."
            />
            <AdminSubscriptionList />
        </>
    );
}
