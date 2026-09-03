import type { ReactNode } from "react";

interface Props {
    label: string;
    children: ReactNode;
}

export default function DetailRow({ label, children }: Props) {
    return (
        <div className="border-border-light flex items-center justify-between gap-3 border-b py-2 last:border-b-0">
            <dt className="text-text-secondary text-xs">{label}</dt>
            <dd className="text-text text-sm">{children}</dd>
        </div>
    );
}
