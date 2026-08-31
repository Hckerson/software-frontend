import type { ReactNode } from "react";

interface Props {
    title: string;
    description?: string;
    actions?: ReactNode;
}

export default function PageHeader({ title, description, actions }: Props) {
    return (
        <header className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
                <h1 className="text-h4 font-display text-text">{title}</h1>
                {description && (
                    <p className="text-text-secondary measure text-sm">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex shrink-0 items-center gap-2">
                    {actions}
                </div>
            )}
        </header>
    );
}
