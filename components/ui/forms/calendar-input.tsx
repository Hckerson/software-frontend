"use client";
import { format, isValid } from "date-fns";
import { DATE_VALUE_FORMAT } from "@/lib/constants";

interface Props {
    value: Date;
    name?: string;
    handleChange: (newValue: string, field: string) => void;
}

export default function CalendarInput({
    value,
    handleChange,
    name = "date",
}: Props) {
    const selected = isValid(value) ? format(value, DATE_VALUE_FORMAT) : "";

    return (
        <input
            id={name}
            name={name}
            type="date"
            value={selected}
            onChange={(event) => handleChange(event.target.value, name)}
            className="smooth border-border bg-background text-text focus-visible:border-accent focus-visible:ring-accent h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
        />
    );
}
