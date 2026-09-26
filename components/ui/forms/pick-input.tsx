"use client";
import clsx from "clsx";

interface Props<T extends string> {
    label: string;
    value: T;
    values: T[];
    handleChange: (value: T) => void;
}

export default function PickInput<T extends string>({
    label,
    value,
    values,
    handleChange,
}: Props<T>) {
    const isChecked = values.includes(value);

    return (
        <label className="group inline-flex cursor-pointer items-center justify-center select-none">
            <input
                id={value}
                type="checkbox"
                checked={isChecked}
                onChange={() => handleChange(value)}
                className="peer sr-only"
            />
            <span
                className={clsx(
                    "smooth peer-focus-visible:ring-accent grid size-10 place-items-center rounded-full border text-xs font-semibold uppercase peer-focus-visible:ring-2",
                    isChecked
                        ? "border-accent bg-accent text-text-inverse"
                        : "border-border bg-background text-text-secondary group-hover:border-border-dark group-hover:text-text",
                )}
            >
                {label.charAt(0)}
            </span>
        </label>
    );
}
