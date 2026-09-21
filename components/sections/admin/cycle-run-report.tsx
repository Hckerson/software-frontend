import type { CycleRunSummary } from "@/lib/types";

interface Props {
    label: string;
    summary: CycleRunSummary;
}

export default function CycleRunReport({ label, summary }: Props) {
    return (
        <div className="flex flex-col gap-1">
            <p className="text-text text-xs font-semibold">{label}</p>
            <p className="text-text-secondary text-xs">
                {summary.examined} examined · {summary.changed} changed ·{" "}
                {summary.skipped} skipped
            </p>
            {summary.details.length > 0 && (
                <ul className="flex flex-col gap-1">
                    {summary.details.map((detail) => (
                        <li
                            key={detail}
                            className="text-text-secondary text-xs"
                        >
                            {detail}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
