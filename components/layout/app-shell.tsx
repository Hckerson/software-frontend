"use client";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import Skeleton from "@/components/common/skeleton";
import { useCurrentUser } from "@/lib/hooks/use-account";
import { ADMIN_ROLE } from "@/lib/constants";
import type { ReactNode } from "react";

export default function AppShell({ children }: { children: ReactNode }) {
    const { data: user, isPending } = useCurrentUser();

    if (isPending) {
        return (
            <div className="app-content">
                <Skeleton lines={6} />
            </div>
        );
    }

    return (
        <div className="app-shell">
            <Sidebar isAdmin={user?.role === ADMIN_ROLE} />
            <div className="app-main">
                <Topbar />
                <div className="app-content">{children}</div>
            </div>
        </div>
    );
}
