"use client";
import Link from "next/link";
import { Gauge } from "lucide-react";
import SidebarGroup from "@/components/layout/sidebar-group";
import { NAV_GROUPS, SETTINGS_ITEM } from "@/lib/data/navigation";

interface Props {
    isAdmin: boolean;
}

export default function Sidebar({ isAdmin }: Props) {
    const groups = NAV_GROUPS.filter((group) => isAdmin || !group.adminOnly);

    return (
        <aside className="app-sidebar">
            <Link
                href="/dashboard"
                className="text-sidebar-text-active flex items-center gap-2 px-3 py-2"
            >
                <Gauge className="size-4 shrink-0" strokeWidth={1.5} />
                <span className="font-display text-h6">Meter</span>
            </Link>

            {groups.map((group) => (
                <SidebarGroup
                    key={group.label}
                    label={group.label}
                    items={group.items}
                />
            ))}

            <div className="mt-auto">
                <SidebarGroup label="Account" items={[SETTINGS_ITEM]} />
            </div>
        </aside>
    );
}
