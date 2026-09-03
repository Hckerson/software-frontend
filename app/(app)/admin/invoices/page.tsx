import PageHeader from "@/components/common/page-header";
import AdminInvoiceHealth from "@/components/sections/admin/admin-invoice-health";
import AdminOverdueInvoices from "@/components/sections/admin/admin-overdue-invoices";

export const metadata = { title: "Invoice health · Meter" };

export default function AdminInvoicesPage() {
    return (
        <>
            <PageHeader
                title="Invoice health"
                description="Collection status across every invoice raised."
            />
            <AdminInvoiceHealth />
            <AdminOverdueInvoices />
        </>
    );
}
