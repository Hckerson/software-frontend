"use client";
import { useState } from "react";
import clsx from "clsx";
import TrendAxes from "@/components/sections/usage/trend-axes";
import TrendTooltip from "@/components/sections/usage/trend-tooltip";
import TrendLimit from "@/components/sections/usage/trend-limit";
import {
    BASELINE,
    CHART,
    PLOT_HEIGHT,
    barWidthFor,
    columnPath,
    axisFor,
    yScale,
} from "@/lib/utils/chart";
import {
    describePoint,
    formatCompact,
    formatPeriodLabel,
    limitLabelSide,
    periodLabels,
} from "@/lib/utils/chart-labels";
import { formatCount } from "@/lib/utils/format";
import type { TrendPoint } from "@/lib/types";

interface Props {
    label: string;
    unit: string;
    points: TrendPoint[];
    limit?: number | null;
    isRefreshing?: boolean;
}

const TOOLTIP_EDGE = 15;
const PLOT_RIGHT = CHART.width - CHART.right;

export default function UsageTrendChart({
    label,
    unit,
    points,
    limit,
    isRefreshing = false,
}: Props) {
    const [active, setActive] = useState<number | null>(null);
    const cap = typeof limit === "number" ? limit : null;
    const { ceiling, ticks } = axisFor(
        Math.max(cap ?? 0, ...points.map((point) => point.amount)),
    );
    const y = yScale(ceiling);
    const band = (PLOT_RIGHT - CHART.left) / points.length;
    const barWidth = barWidthFor(band);
    const centre = (index: number) => CHART.left + band * index + band / 2;
    const last = points.length - 1;
    const endTop = y(points[last].amount);
    const side = cap === null ? null : limitLabelSide(points, centre, y, cap);
    const labels = periodLabels(points, centre);
    const current = active === null ? null : points[active];

    return (
        <figure
            className={clsx("trend-chart", isRefreshing && "is-refreshing")}
        >
            <figcaption className="text-text text-xs font-semibold">
                {label}
                <span className="text-text-muted font-normal">
                    {limit === null && " · unlimited on your plan"}
                    {cap !== null && ` · limit ${formatCount(cap)} ${unit}`}
                </span>
            </figcaption>
            <div className="trend-plot">
                <svg
                    viewBox={`0 0 ${CHART.width} ${CHART.height}`}
                    role="group"
                    aria-label={`${label} by billing period`}
                >
                    <TrendAxes
                        ceiling={ceiling}
                        ticks={ticks}
                        labels={labels}
                    />
                    {points.map((point, index) => (
                        <path
                            key={point.period}
                            className={clsx(
                                "trend-bar",
                                active === index && "is-active",
                            )}
                            d={columnPath(
                                centre(index) - barWidth / 2,
                                y(point.amount),
                                barWidth,
                                BASELINE,
                            )}
                        />
                    ))}
                    {cap !== null && (
                        <TrendLimit y={y(cap)} limit={cap} side={side} />
                    )}
                    <text
                        className="trend-value"
                        x={centre(last)}
                        y={endTop - 6}
                        textAnchor="middle"
                    >
                        {formatCompact(points[last].amount)}
                    </text>
                    {points.map((point, index) => (
                        <rect
                            key={`hit-${point.period}`}
                            className="trend-hit"
                            x={CHART.left + band * index}
                            y={CHART.top}
                            width={band}
                            height={PLOT_HEIGHT}
                            tabIndex={0}
                            role="img"
                            aria-label={describePoint(point, unit, cap)}
                            onPointerEnter={() => setActive(index)}
                            onPointerLeave={() => setActive(null)}
                            onFocus={() => setActive(index)}
                            onBlur={() => setActive(null)}
                        />
                    ))}
                </svg>
                {current && active !== null && (
                    <TrendTooltip
                        left={Math.min(
                            100 - TOOLTIP_EDGE,
                            Math.max(
                                TOOLTIP_EDGE,
                                (centre(active) / CHART.width) * 100,
                            ),
                        )}
                        top={(y(current.amount) / CHART.height) * 100}
                        value={`${formatCount(current.amount)} ${unit}`}
                        caption={formatPeriodLabel(current.period, true)}
                    />
                )}
            </div>
        </figure>
    );
}
