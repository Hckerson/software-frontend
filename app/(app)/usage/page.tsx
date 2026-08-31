import PageHeader from "@/components/common/page-header";
import UsageSummary from "@/components/sections/usage/usage-summary";
import UsageHistory from "@/components/sections/usage/usage-history";

export const metadata = { title: "Usage · Meter" };

export default function UsagePage() {
    return (
        <>
            <PageHeader
                title="Usage"
                description="Quota consumed this period, and every period before it."
            />
            <UsageSummary />
            <UsageHistory />
        </>
    );
}
