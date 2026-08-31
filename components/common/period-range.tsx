import { formatPeriod } from "@/lib/utils/format";

interface Props {
    start: string | null | undefined;
    end: string | null | undefined;
}

export default function PeriodRange({ start, end }: Props) {
    return (
        <span className="text-text-secondary whitespace-nowrap">
            {formatPeriod(start, end)}
        </span>
    );
}
