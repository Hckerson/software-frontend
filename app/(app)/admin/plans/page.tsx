import PageHeader from "@/components/common/page-header";
import AdminPlanList from "@/components/sections/admin/admin-plan-list";
import AdminPlanForm from "@/components/sections/admin/admin-plan-form";

export const metadata = { title: "Plan catalogue · Meter" };

export default function AdminPlansPage() {
    return (
        <>
            <PageHeader
                title="Plan catalogue"
                description="Publish, price and retire the plans customers can subscribe to."
            />
            <AdminPlanList />
            <AdminPlanForm />
        </>
    );
}
