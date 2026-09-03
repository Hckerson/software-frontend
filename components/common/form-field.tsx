"use client";
import { useId } from "react";
import type { ChangeEvent, HTMLInputTypeAttribute } from "react";

interface Props {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: HTMLInputTypeAttribute;
    placeholder?: string;
    error?: string;
    required?: boolean;
    autoComplete?: string;
}

const INPUT_CLASS =
    "smooth border-border bg-background text-text placeholder:text-text-muted focus-visible:border-accent focus-visible:ring-accent h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none";

export default function FormField({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    error,
    required = false,
    autoComplete,
}: Props) {
    const id = useId();
    const errorId = `${id}-error`;

    return (
        <div className="flex w-full flex-col gap-1">
            <label htmlFor={id} className="text-text text-xs font-semibold">
                {label}
                {required && <span className="text-error">{" *"}</span>}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                required={required}
                autoComplete={autoComplete}
                placeholder={placeholder}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    onChange(event.target.value)
                }
                className={INPUT_CLASS}
            />
            {error && (
                <p id={errorId} className="text-error text-xs">
                    {error}
                </p>
            )}
        </div>
    );
}
