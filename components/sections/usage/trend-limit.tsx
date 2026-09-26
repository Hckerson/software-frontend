import { CHART } from "@/lib/utils/chart";
import { formatCompact } from "@/lib/utils/chart-labels";
import type { LabelSide } from "@/lib/types";

interface Props {
    y: number;
    limit: number;
    side: LabelSide;
}

const PLOT_RIGHT = CHART.width - CHART.right;

export default function TrendLimit({ y, limit, side }: Props) {
    return (
        <>
            <line
                className="trend-limit"
                x1={CHART.left}
                x2={PLOT_RIGHT}
                y1={y}
                y2={y}
            />
            {side !== null && (
                <text
                    className="trend-axis"
                    x={side === "start" ? CHART.left + 4 : PLOT_RIGHT}
                    y={y - 4}
                    textAnchor={side}
                >
                    {`Limit ${formatCompact(limit)}`}
                </text>
            )}
        </>
    );
}
