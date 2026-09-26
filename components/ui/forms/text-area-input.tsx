"use client";
import type { ChangeEvent } from "react";

interface Props {
    rows: number;
    label: string;
    value: string;
    handleChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function TextAreaInput({
    rows,
    label,
    value,
    handleChange,
}: Props) {
    return (
        <textarea
            id={label}
            name={label}
            rows={rows}
            value={value}
            placeholder={`Enter ${label}`}
            onChange={handleChange}
            className="smooth border-border bg-background text-text placeholder:text-text-muted focus-visible:border-accent focus-visible:ring-accent w-full resize-y rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
        />
    );
}
