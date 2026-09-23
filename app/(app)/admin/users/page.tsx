import PageHeader from "@/components/common/page-header";
import AdminUserList from "@/components/sections/admin/admin-user-list";

export const metadata = { title: "Customers · Meter" };

export default function AdminUsersPage() {
    return (
        <>
            <PageHeader
                title="Customers"
                description="Every account on the platform, with its plan and whether it can sign in."
            />
            <AdminUserList />
        </>
    );
}
