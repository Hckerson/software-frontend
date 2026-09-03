import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
    title: string;
    description?: string;
    icon?: LucideIcon;
    action?: ReactNode;
}

export default function EmptyState({
    title,
    description,
    icon: Icon,
    action,
}: Props) {
    return (
        <div className="empty-state">
            {Icon && (
                <Icon className="text-text-muted size-6" strokeWidth={1.25} />
            )}
            <p className="text-text text-sm font-medium">{title}</p>
            {description && (
                <p className="text-text-secondary measure text-xs">
                    {description}
                </p>
            )}
            {action}
        </div>
    );
}
