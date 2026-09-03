"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/data/navigation";

interface Props {
    label: string;
    items: NavItem[];
}

const isActive = (pathname: string, href: string): boolean =>
    pathname === href || pathname.startsWith(`${href}/`);

export default function SidebarGroup({ label, items }: Props) {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col gap-1" aria-label={label}>
            <p className="micro-label text-sidebar-text px-3 pb-1">{label}</p>
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className="nav-link"
                    data-active={isActive(pathname, item.href)}
                    aria-current={
                        isActive(pathname, item.href) ? "page" : undefined
                    }
                >
                    <item.icon className="size-4 shrink-0" strokeWidth={1.5} />
                    {item.label}
                </Link>
            ))}
        </nav>
    );
}
