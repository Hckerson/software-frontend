"use client";
import type { ChangeEvent } from "react";

interface Props {
    label: string;
    value: string;
    handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function TextInput({ label, value, handleChange }: Props) {
    return (
        <input
            id={label}
            name={label}
            type="text"
            value={value}
            placeholder={`Enter ${label}`}
            onChange={handleChange}
            className="smooth border-border bg-background text-text placeholder:text-text-muted focus-visible:border-accent focus-visible:ring-accent h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
        />
    );
}
