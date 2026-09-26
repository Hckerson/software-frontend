import PageHeader from "@/components/common/page-header";
import UsageSummary from "@/components/sections/usage/usage-summary";
import PlanSummary from "@/components/sections/dashboard/plan-summary";
import NextInvoice from "@/components/sections/dashboard/next-invoice";
import RecentInvoices from "@/components/sections/dashboard/recent-invoices";

export const metadata = { title: "Dashboard · Meter" };

export default function DashboardPage() {
    return (
        <>
            <PageHeader
                title="Dashboard"
                description="Your plan, your usage against its limits, and what is due next."
            />
            <UsageSummary />
            <div className="split-grid">
                <PlanSummary />
                <NextInvoice />
            </div>
            <RecentInvoices />
        </>
    );
}
