interface Props {
    left: number;
    top: number;
    value: string;
    caption: string;
}

export default function TrendTooltip({ left, top, value, caption }: Props) {
    return (
        <div
            className="trend-tooltip"
            style={{ left: `${left}%`, top: `${top}%` }}
        >
            <strong className="text-text text-xs">{value}</strong>
            <span className="text-text-secondary text-xs">{caption}</span>
        </div>
    );
}
