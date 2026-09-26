import clsx from "clsx";
import type { ReactNode } from "react";

interface Props {
    title?: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
    bodyless?: boolean;
    className?: string;
}

export default function SectionCard({
    title,
    description,
    action,
    children,
    bodyless = false,
    className,
}: Props) {
    return (
        <section className={clsx("section-card", className)}>
            {title && (
                <header className="section-card-header">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-text text-sm font-semibold">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-text-secondary text-xs">
                                {description}
                            </p>
                        )}
                    </div>
                    {action && (
                        <div className="flex shrink-0 items-center gap-2">
                            {action}
                        </div>
                    )}
                </header>
            )}
            {bodyless ? (
                children
            ) : (
                <div className="section-card-body">{children}</div>
            )}
        </section>
    );
}
