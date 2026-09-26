import clsx from "clsx";
import { statusTone } from "@/lib/utils/status";
import { titleCase } from "@/lib/utils/format";
import type { StatusTone } from "@/lib/types";

interface Props {
    status: string;
    className?: string;
}

const TONE_CLASS: Record<StatusTone, string> = {
    success: "status-pill--success",
    warning: "status-pill--warning",
    error: "status-pill--error",
    info: "status-pill--info",
    neutral: "",
};

export default function StatusPill({ status, className }: Props) {
    return (
        <span
            className={clsx(
                "status-pill",
                TONE_CLASS[statusTone(status)],
                className,
            )}
        >
            {titleCase(status)}
        </span>
    );
}
