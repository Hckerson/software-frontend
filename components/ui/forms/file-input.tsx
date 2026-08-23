"use client";
import { Upload } from "lucide-react";

interface Props {
    name?: string;
    label?: string;
}

export default function FileInput({
    name = "file",
    label = "Click to upload",
}: Props) {
    return (
        <label
            htmlFor={name}
            className="smooth border-border text-text-secondary hover:border-accent hover:text-accent focus-within:ring-accent relative flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed focus-within:ring-2"
        >
            <input
                id={name}
                name={name}
                type="file"
                className="absolute inset-0 cursor-pointer opacity-0"
            />
            <Upload className="size-3 shrink-0" strokeWidth={1.5} />
            <span className="truncate text-xs">{label}</span>
        </label>
    );
}
