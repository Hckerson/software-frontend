import PageHeader from "@/components/common/page-header";
import AdminOverview from "@/components/sections/admin/admin-overview";
import AdminOverdueInvoices from "@/components/sections/admin/admin-overdue-invoices";
import AdminCycleControls from "@/components/sections/admin/admin-cycle-controls";

export const metadata = { title: "Admin · Meter" };

export default function AdminPage() {
    return (
        <>
            <PageHeader
                title="Platform overview"
                description="Accounts and billing health across every customer."
            />
            <AdminOverview />
            <AdminCycleControls />
            <AdminOverdueInvoices />
        </>
    );
}
