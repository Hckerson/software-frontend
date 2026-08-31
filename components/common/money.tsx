import clsx from "clsx";
import { formatMoney } from "@/lib/utils/format";
import { DEFAULT_CURRENCY } from "@/lib/constants";

interface Props {
    amount: string | number | null | undefined;
    className?: string;
    showCurrency?: boolean;
}

export default function Money({
    amount,
    className,
    showCurrency = false,
}: Props) {
    return (
        <span className={clsx("font-mono whitespace-nowrap", className)}>
            {formatMoney(amount)}
            {showCurrency && (
                <span className="text-text-muted text-xs">
                    {` ${DEFAULT_CURRENCY}`}
                </span>
            )}
        </span>
    );
}
