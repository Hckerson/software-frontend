import PageHeader from "@/components/common/page-header";
import LinkButton from "@/components/common/link-button";
import InvoiceDetail from "@/components/sections/invoices/invoice-detail";

export const metadata = { title: "Invoice · Meter" };

export default async function InvoicePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <>
            <PageHeader
                title="Invoice"
                actions={
                    <LinkButton href="/invoices" tone="quiet" size="sm">
                        Back to invoices
                    </LinkButton>
                }
            />
            <InvoiceDetail invoiceId={id} />
        </>
    );
}
