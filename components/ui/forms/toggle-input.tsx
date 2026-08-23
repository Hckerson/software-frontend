"use client";
import clsx from "clsx";
import { useState } from "react";

interface Props {
    label?: string;
    value?: boolean;
    handleChange?: (checked: boolean) => void;
}

export default function ToggleInput({ label, value, handleChange }: Props) {
    const [internal, setInternal] = useState(value ?? false);
    const isChecked = value ?? internal;

    const toggle = () => {
        setInternal(!isChecked);
        handleChange?.(!isChecked);
    };

    return (
        <label className="flex h-9 cursor-pointer items-center gap-2 select-none">
            <input
                type="checkbox"
                checked={isChecked}
                onChange={toggle}
                className="peer sr-only"
            />
            <span
                className={clsx(
                    "smooth peer-focus-visible:ring-accent relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border peer-focus-visible:ring-2",
                    isChecked
                        ? "border-accent bg-accent"
                        : "border-border bg-background-muted",
                )}
            >
                <span
                    className={clsx(
                        "smooth absolute size-3.5 rounded-full",
                        isChecked
                            ? "bg-text-inverse translate-x-4"
                            : "bg-text-muted translate-x-1",
                    )}
                />
            </span>
            {label && (
                <span className="text-text-secondary truncate text-xs">
                    {label}
                </span>
            )}
        </label>
    );
}
