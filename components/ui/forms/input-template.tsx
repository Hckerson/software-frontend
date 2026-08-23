import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
    label: string;
    icon?: LucideIcon;
    className?: string;
    children: ReactNode;
    rightSection?: ReactNode;
}

export default function InputTemplate({
    label,
    icon: Icon,
    className,
    children,
    rightSection,
}: Props) {
    return (
        <section
            className={clsx(
                "border-border bg-background-alt flex w-full flex-col rounded-lg border",
                className,
            )}
        >
            <header className="border-border-light flex h-9 items-center justify-between gap-2 border-b px-3">
                <div className="flex items-center gap-2 truncate">
                    {Icon && (
                        <Icon
                            className="text-text-muted size-3 shrink-0"
                            strokeWidth={1.5}
                        />
                    )}
                    <span className="text-text truncate text-xs font-semibold">
                        {label}
                    </span>
                </div>
                {rightSection && (
                    <div className="flex shrink-0 items-center gap-2">
                        {rightSection}
                    </div>
                )}
            </header>
            <div className="flex flex-1 flex-col gap-2 p-3">{children}</div>
        </section>
    );
}
