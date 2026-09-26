import {
    CreditCard,
    FileText,
    Gauge,
    Layers,
    LayoutDashboard,
    ReceiptText,
    Settings,
    ShieldCheck,
    UserCog,
    Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
}

export interface NavGroup {
    label: string;
    adminOnly: boolean;
    items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
    {
        label: "Billing",
        adminOnly: false,
        items: [
            {
                href: "/dashboard",
                label: "Dashboard",
                icon: LayoutDashboard,
            },
            { href: "/usage", label: "Usage", icon: Gauge },
            {
                href: "/subscription",
                label: "Subscription",
                icon: CreditCard,
            },
            { href: "/invoices", label: "Invoices", icon: FileText },
            { href: "/plans", label: "Plans", icon: Layers },
        ],
    },
    {
        label: "Administration",
        adminOnly: true,
        items: [
            { href: "/admin", label: "Overview", icon: ShieldCheck },
            { href: "/admin/plans", label: "Plan catalogue", icon: Layers },
            { href: "/admin/users", label: "Customers", icon: UserCog },
            {
                href: "/admin/subscriptions",
                label: "Subscriptions",
                icon: Users,
            },
            {
                href: "/admin/invoices",
                label: "Overdue invoices",
                icon: ReceiptText,
            },
        ],
    },
];

export const SETTINGS_ITEM: NavItem = {
    href: "/settings",
    label: "Settings",
    icon: Settings,
};
