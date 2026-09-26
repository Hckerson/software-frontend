import PageHeader from "@/components/common/page-header";
import PlanCatalog from "@/components/sections/plans/plan-catalog";

export const metadata = { title: "Plans · Meter" };

export default function PlansPage() {
    return (
        <>
            <PageHeader
                title="Plans"
                description="Compare limits and price. Changing plan keeps your billing history."
            />
            <PlanCatalog />
        </>
    );
}
