"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { activeHref } from "@/lib/utils/navigation";
import type { NavItem } from "@/lib/data/navigation";

interface Props {
    label: string;
    items: NavItem[];
}

export default function SidebarGroup({ label, items }: Props) {
    const pathname = usePathname();
    const active = activeHref(
        pathname,
        items.map((item) => item.href),
    );

    return (
        <nav className="flex flex-col gap-1" aria-label={label}>
            <p className="micro-label text-sidebar-text px-3 pb-1">{label}</p>
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className="nav-link"
                    data-active={item.href === active}
                    aria-current={item.href === active ? "page" : undefined}
                >
                    <item.icon className="size-4 shrink-0" strokeWidth={1.5} />
                    {item.label}
                </Link>
            ))}
        </nav>
    );
}
