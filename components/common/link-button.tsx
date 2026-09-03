import clsx from "clsx";
import Link from "next/link";
import {
    BUTTON_BASE,
    BUTTON_SIZES,
    BUTTON_TONES,
} from "@/components/common/button-styles";
import type { ReactNode } from "react";

interface Props {
    href: string;
    children: ReactNode;
    size?: keyof typeof BUTTON_SIZES;
    tone?: keyof typeof BUTTON_TONES;
    className?: string;
}

export default function LinkButton({
    href,
    children,
    size = "md",
    tone = "accent",
    className,
}: Props) {
    return (
        <Link
            href={href}
            className={clsx(
                BUTTON_BASE,
                BUTTON_SIZES[size],
                BUTTON_TONES[tone],
                className,
            )}
        >
            {children}
        </Link>
    );
}
