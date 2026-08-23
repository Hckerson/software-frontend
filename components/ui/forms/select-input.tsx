"use client";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Option {
    label: string;
    value: string | undefined;
}

interface Props {
    label: string;
    data: Option[];
    value: string | undefined;
    handleChange: (newValue: string | undefined, field: string) => void;
}

export default function SelectInput({
    label,
    data,
    value,
    handleChange,
}: Props) {
    const selectRef = useRef<HTMLDivElement | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const closeOnOutside = (event: MouseEvent) => {
            if (!selectRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };

        document.addEventListener("mousedown", closeOnOutside);
        document.addEventListener("keydown", closeOnEscape);

        return () => {
            document.removeEventListener("mousedown", closeOnOutside);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, []);

    const selected = data.find((option) => option.value === value);
    const options: Option[] = [{ label: "All", value: undefined }, ...data];

    return (
        <div ref={selectRef} className="z-dropdown relative w-full">
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                className="smooth border-border bg-background text-text focus-visible:ring-accent flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 text-left focus-visible:ring-2 focus-visible:outline-none"
            >
                <span
                    className={clsx(
                        "truncate text-sm",
                        selected ? "text-text" : "text-text-muted",
                    )}
                >
                    {selected?.label ?? label}
                </span>
                <ChevronDown
                    className={clsx(
                        "text-text-muted size-3 shrink-0 transition-transform duration-200",
                        isOpen && "rotate-180",
                    )}
                    strokeWidth={1.5}
                />
            </button>
            {isOpen && (
                <ul
                    role="listbox"
                    aria-label={label}
                    className="border-border bg-background-alt z-popover absolute top-full left-0 mt-1 max-h-60 w-full overflow-y-auto rounded-md border py-1 shadow-md"
                >
                    {options.map((option) => (
                        <li key={option.value ?? "all"} role="none">
                            <button
                                type="button"
                                role="option"
                                aria-selected={option.value === value}
                                onClick={() => {
                                    handleChange(option.value, label);
                                    setIsOpen(false);
                                }}
                                className={clsx(
                                    "smooth hover:bg-background-muted focus-visible:bg-background-muted flex h-9 w-full items-center px-3 text-left text-xs focus-visible:outline-none",
                                    option.value === value
                                        ? "text-accent font-semibold"
                                        : "text-text-secondary",
                                )}
                            >
                                <span className="truncate">{option.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
