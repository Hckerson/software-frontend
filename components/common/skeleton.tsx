import clsx from "clsx";

interface Props {
    lines?: number;
    className?: string;
}

const HEIGHT = "h-4";

export default function Skeleton({ lines = 3, className }: Props) {
    return (
        <div
            className={clsx("flex w-full flex-col gap-2", className)}
            aria-busy="true"
            aria-live="polite"
        >
            {Array.from({ length: lines }, (_, index) => (
                <div key={index} className={clsx("skeleton w-full", HEIGHT)} />
            ))}
        </div>
    );
}
