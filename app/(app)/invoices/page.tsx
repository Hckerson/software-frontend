import PageHeader from "@/components/common/page-header";
import InvoiceList from "@/components/sections/invoices/invoice-list";

export const metadata = { title: "Invoices · Meter" };

export default function InvoicesPage() {
    return (
        <>
            <PageHeader
                title="Invoices"
                description="Every invoice raised against your subscription."
            />
            <InvoiceList />
        </>
    );
}
