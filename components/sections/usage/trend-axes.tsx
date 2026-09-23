import { CHART, yScale } from "@/lib/utils/chart";
import { formatCompact } from "@/lib/utils/chart-labels";

interface Props {
    ceiling: number;
    ticks: number[];
    labels: { key: string; x: number; text: string }[];
}

export default function TrendAxes({ ceiling, ticks, labels }: Props) {
    const y = yScale(ceiling);

    return (
        <>
            {ticks.map((tick) => (
                <g key={tick}>
                    <line
                        className={
                            tick === 0 ? "trend-baseline" : "trend-grid-line"
                        }
                        x1={CHART.left}
                        x2={CHART.width - CHART.right}
                        y1={y(tick)}
                        y2={y(tick)}
                    />
                    <text
                        className="trend-axis"
                        x={CHART.left - 6}
                        y={y(tick)}
                        textAnchor="end"
                        dominantBaseline="middle"
                    >
                        {formatCompact(tick)}
                    </text>
                </g>
            ))}
            {labels.map((label) => (
                <text
                    key={label.key}
                    className="trend-axis"
                    x={label.x}
                    y={CHART.height - 6}
                    textAnchor="middle"
                >
                    {label.text}
                </text>
            ))}
        </>
    );
}
