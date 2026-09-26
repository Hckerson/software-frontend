import PageHeader from "@/components/common/page-header";
import SubscriptionDetail from "@/components/sections/subscription/subscription-detail";
import SubscriptionHistory from "@/components/sections/subscription/subscription-history";
import SubscriptionActions from "@/components/sections/subscription/subscription-actions";

export const metadata = { title: "Subscription · Meter" };

export default function SubscriptionPage() {
    return (
        <>
            <PageHeader
                title="Subscription"
                description="Your current plan, its billing period, and how to change or cancel it."
            />
            <SubscriptionDetail />
            <SubscriptionHistory />
            <SubscriptionActions />
        </>
    );
}
