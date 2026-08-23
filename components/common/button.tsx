"use client";
import clsx from "clsx";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type ButtonSize = "sm" | "md" | "lg" | "xl";
type ButtonTone = "accent" | "quiet" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    size?: ButtonSize;
    tone?: ButtonTone;
}

const sizes: Record<ButtonSize, string> = {
    sm: "h-8 gap-1.5 rounded-md px-3 text-xs",
    md: "h-9 gap-2 rounded-md px-4 text-xs",
    lg: "h-10 gap-2 rounded-lg px-5 text-sm",
    xl: "h-11 gap-2 rounded-lg px-6 text-sm",
};

const tones: Record<ButtonTone, string> = {
    accent: "border-accent bg-accent text-text-inverse hover:bg-accent-dark",
    quiet: "border-border bg-background-muted text-text hover:border-border-dark",
    ghost: "border-transparent text-text-secondary hover:bg-background-muted hover:text-text",
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
    {
        children,
        isLoading = false,
        size = "md",
        tone = "accent",
        className,
        disabled,
        type = "button",
        ...rest
    },
    ref,
) {
    return (
        <button
            {...rest}
            ref={ref}
            type={type}
            disabled={disabled ?? isLoading}
            aria-busy={isLoading}
            className={clsx(
                "smooth font-body inline-flex cursor-pointer items-center justify-center border font-medium select-none",
                "focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none",
                "disabled:cursor-not-allowed disabled:opacity-50",
                sizes[size],
                tones[tone],
                className,
            )}
        >
            {isLoading && (
                <Loader2 className="size-3 animate-spin" strokeWidth={1.5} />
            )}
            {children}
        </button>
    );
});

export default Button;
