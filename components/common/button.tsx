"use client";
import clsx from "clsx";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import {
    BUTTON_BASE,
    BUTTON_SIZES,
    BUTTON_TONES,
} from "@/components/common/button-styles";
import type { ButtonHTMLAttributes } from "react";

type ButtonSize = keyof typeof BUTTON_SIZES;
type ButtonTone = keyof typeof BUTTON_TONES;

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    size?: ButtonSize;
    tone?: ButtonTone;
}

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
                BUTTON_BASE,
                BUTTON_SIZES[size],
                BUTTON_TONES[tone],
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
