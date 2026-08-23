"use client";
import clsx from "clsx";
import { Check } from "lucide-react";

interface Props<T extends string> {
    label: string;
    value: T;
    values: T[];
    handleChange: (value: T) => void;
}

export default function CheckBoxInput<T extends string>({
    label,
    value,
    values,
    handleChange,
}: Props<T>) {
    const isChecked = values.includes(value);

    return (
        <label className="group flex h-9 cursor-pointer items-center gap-2 select-none">
            <input
                id={value}
                type="checkbox"
                checked={isChecked}
                onChange={() => handleChange(value)}
                className="peer sr-only"
            />
            <span
                className={clsx(
                    "smooth peer-focus-visible:ring-accent grid size-4 shrink-0 place-items-center rounded-sm border peer-focus-visible:ring-2",
                    isChecked
                        ? "border-accent bg-accent text-text-inverse"
                        : "border-border bg-background group-hover:border-border-dark",
                )}
            >
                <Check
                    className={clsx(
                        "size-3 transition-opacity duration-200",
                        isChecked ? "opacity-100" : "opacity-0",
                    )}
                    strokeWidth={1.5}
                />
            </span>
            <span
                className={clsx(
                    "truncate text-xs",
                    isChecked ? "text-text" : "text-text-secondary",
                )}
            >
                {label}
            </span>
        </label>
    );
}
