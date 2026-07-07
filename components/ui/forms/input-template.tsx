import clsx from "clsx";
import Image from "next/image";
import { format } from "date-fns";
import BinIcon from "@/components/icons/bin";
import { poppins } from "@/public/fonts/font";
import UploadIcon from "@/components/icons/upload";
import { Calendar } from "../../general/calendar";
import React, { useEffect, useRef, useState } from "react";

interface TemplateProps {
    label: string;
    style?: string;
    iconSrc?: string;
    children: React.ReactNode;
    rightSection?: React.ReactNode;
}

export default function InputTemplate({
    label,
    style,
    children,
    rightSection,
    iconSrc = "/images/general/bell.png",
}: TemplateProps) {
    return (
        <div
            className={clsx(
                "relative z-10 box-border w-full flex-1 rounded-xl bg-[#051726] py-1 md:rounded-2xl",
                style,
            )}
        >
            <div
                className={clsx(
                    "relative flex h-full w-full flex-col rounded-3xl",
                )}
            >
                <div className="sticky top-0 flex items-center rounded-3xl p-4">
                    <div className="flex w-full justify-between">
                        <div className="flex w-fit gap-x-2">
                            <div className="shrink-0">
                                <Image
                                    src={iconSrc}
                                    width={25}
                                    height={25}
                                    alt={`Messaging icon`}
                                />
                            </div>
                            <p className={``}>{label}</p>
                        </div>
                        <div className="flex items-center gap-x-2">
                            {rightSection}
                        </div>
                    </div>
                </div>
                <div
                    className={clsx("pad flex-1 p-4 pt-0!", poppins.className)}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

const TextInput = ({
    label,
    value,
    handleChange,
}: {
    label: string;
    value: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
    return (
        <input
            type="text"
            name={label}
            id={label}
            value={value}
            placeholder={`Enter ${label}`}
            className="w-full rounded-lg bg-white/5 p-3 focus:outline-none md:rounded-xl"
            onChange={handleChange}
        />
    );
};

const TextAreaInput = ({
    rows,
    label,
    value,
    handleChange,
}: {
    rows: number;
    label: string;
    value: string;
    handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => {
    return (
        <textarea
            name={label}
            id={label}
            value={value}
            rows={rows}
            placeholder={`Enter ${label}`}
            className="w-full rounded-lg bg-white/5 p-3 focus:outline-none md:rounded-xl"
            onChange={handleChange}
        />
    );
};

const CheckBoxInput = <T extends string>({
    label,
    value,
    values,
    handleChange,
}: {
    label: string;
    value: T;
    values: T[];
    handleChange: (value: T) => void;
}) => {
    const isChecked = values.includes(value);
    return (
        <label className="group inline-flex cursor-pointer items-center gap-x-3 select-none">
            <input
                type="checkbox"
                id={value}
                checked={isChecked}
                onChange={() => handleChange(value)}
                className="sr-only"
            />
            {/* Custom checkbox box */}
            <span
                className={clsx(
                    "relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200",
                    isChecked
                        ? "border-[#00cbe2] bg-[#00cbe2]/15 shadow-[0_0_10px_2px_#00cbe250]"
                        : "border-white/20 bg-white/5 group-hover:border-[#00cbe2]/40 group-hover:bg-white/10",
                )}
            >
                {/* Animated checkmark */}
                <svg
                    viewBox="0 0 12 10"
                    className={clsx(
                        "h-3 w-3 transition-all duration-200",
                        isChecked
                            ? "scale-100 opacity-100"
                            : "scale-50 opacity-0",
                    )}
                    fill="none"
                    stroke="#00cbe2"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="1,5 4,8 11,1" />
                </svg>
            </span>
            <span
                className={clsx(
                    "text-sm transition-colors duration-200",
                    isChecked
                        ? "text-white"
                        : "text-white/60 group-hover:text-white/80",
                )}
            >
                {label}
            </span>
        </label>
    );
};

const PickInput = <T extends string>({
    label,
    value,
    values,
    handleChange,
}: {
    label: string;
    value: T;
    values: T[];
    handleChange: (value: T) => void;
}) => {
    const isChecked = values.includes(value);
    return (
        <div className="flex w-full flex-1 items-center justify-center">
            <label className="group inline-flex size-15 cursor-pointer items-center justify-center gap-x-3 select-none">
                <input
                    type="checkbox"
                    id={value}
                    checked={isChecked}
                    onChange={() => handleChange(value)}
                    className="sr-only"
                />
                {/* Custom checkbox box */}
                <span
                    className={clsx(
                        "relative flex size-full shrink-0 items-center justify-center rounded-full border transition-all duration-200",
                        isChecked
                            ? "border-[#00cbe2] bg-[#00cbe2]/15 shadow-[0_0_10px_2px_#00cbe250]"
                            : "border-white/20 bg-white/5 group-hover:border-[#00cbe2]/40 group-hover:bg-white/10",
                    )}
                >
                    <span
                        className={clsx(
                            "text-md transition-colors duration-200",
                            isChecked
                                ? "text-white"
                                : "text-white/60 group-hover:text-white/80",
                        )}
                    >
                        {label[0]}
                    </span>
                </span>
            </label>
        </div>
    );
};

const SelectInput = ({
    label,
    data,
    value,
    handleChange,
}: {
    label: string;
    value: string | undefined;
    data: { label: string; value: string | undefined }[];
    handleChange: (newValue: string | undefined, field: string) => void;
}) => {
    const selectRef = useRef<HTMLDivElement | null>(null);
    const [selectionStatus, setSelectionStatus] = useState<boolean>(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                selectRef.current &&
                !selectRef.current.contains(event.target as Node)
            ) {
                setSelectionStatus(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    return (
        <div
            ref={selectRef}
            className="relative z-30 flex items-center justify-between rounded-md bg-white/10 sm:rounded-lg"
        >
            <button
                onClick={() => setSelectionStatus(!selectionStatus)}
                className="flex w-full items-center justify-between px-2 py-3 text-left outline-none sm:px-3"
            >
                <span className="truncate text-white/50">
                    {data.find((r) => r.value === value)?.label || label}
                </span>
                <div className="rounded-sm p-1 hover:bg-[#111F33]">
                    <Image
                        height={50}
                        width={50}
                        alt="Caret down icon"
                        src={"/svgs/caret-down.svg"}
                        className={clsx(
                            "size-5 transition-transform duration-200",
                            selectionStatus && "rotate-180",
                        )}
                    />
                </div>
            </button>
            {selectionStatus && (
                <ul className="absolute top-[105%] left-0 z-50 max-h-60 w-full overflow-auto rounded-md border border-white/10 bg-[#051B3A] shadow-lg [scrollbar-color:#051b3a_#051428] [scrollbar-width:thin]">
                    <li
                        onClick={() => {
                            handleChange(undefined, label);
                            setSelectionStatus(false);
                        }}
                        className="cursor-pointer px-4 py-2 text-white/70 hover:bg-white/10 hover:text-white"
                    >
                        All
                    </li>
                    {data.map((datum) => (
                        <li
                            key={datum.value}
                            onClick={() => {
                                handleChange(datum.value, label);
                                setSelectionStatus(false);
                            }}
                            className="cursor-pointer px-4 py-2 text-white/70 hover:bg-white/10 hover:text-white"
                        >
                            {datum.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const CalendarInput = ({
    value,
    handleChange,
    name = "date",
}: {
    value: Date;
    name: string;
    handleChange: (newValue: string, field: string) => void;
}) => {
    return (
        <Calendar
            mode="single"
            selected={value}
            onSelect={(newDate: Date | undefined) => {
                if (newDate instanceof Date) {
                    handleChange(format(newDate, "yyyy-MM-dd"), name);
                } else {
                    handleChange("Set Date", name);
                }
            }}
            className="rounded-md border border-white/10"
        />
    );
};

const FileInput = () => {
    return (
        <div className="flex w-full items-center justify-between gap-x-4">
            <span className="relative flex h-12 w-full rounded-lg border border-dashed border-blue-600 bg-white/5 px-3 hover:bg-white/10 focus:outline-none md:rounded-xl">
                <input
                    type="file"
                    className="absolute inset-0 z-10 opacity-0"
                />
                <div className="inset-0 my-auto flex w-full items-center justify-center space-x-2 text-blue-600">
                    <UploadIcon size="25" />
                    <p>Click to upload</p>
                </div>
            </span>
            <div className="flex items-center justify-center rounded-lg p-2 hover:bg-stone-800">
                <BinIcon size="20" stroke="none" fill="currentColor" />
            </div>
        </div>
    );
};

const ToggleInput = ({
    label,
    value,
    handleChange,
}: {
    label?: string;
    value?: boolean;
    handleChange?: (checked: boolean) => void;
} = {}) => {
    const [isChecked, setIsChecked] = useState(value ?? false);

    const handleToggle = () => {
        const newValue = !isChecked;
        setIsChecked(newValue);
        handleChange?.(newValue);
    };

    return (
        <label className="flex cursor-pointer items-center gap-x-3 select-none">
            <input
                type="checkbox"
                checked={isChecked}
                onChange={handleToggle}
                className="sr-only"
            />
            <span
                className={clsx(
                    "relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-all duration-200",
                    isChecked
                        ? "border-[#00cbe2] bg-[#00cbe2]/30"
                        : "border-white/20 bg-white/5",
                )}
            >
                <span
                    className={clsx(
                        "absolute top-1 left-1 h-4 w-4 -translate-y-px rounded-full bg-white transition-transform duration-200",
                        isChecked && "translate-x-4.5",
                    )}
                />
            </span>
            {label && <span className="text-sm text-white/80">{label}</span>}
        </label>
    );
};

export {
    SelectInput,
    TextInput,
    CalendarInput,
    FileInput,
    TextAreaInput,
    CheckBoxInput,
    PickInput,
    ToggleInput,
};
