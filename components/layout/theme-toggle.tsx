"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import Button from "@/components/common/button";
import { useIsClient } from "@/lib/hooks/use-is-client";
import { applyTheme, nextTheme, storedTheme } from "@/lib/utils/theme";
import type { Theme } from "@/lib/types";

const DEFAULT_THEME: Theme = "light";

export default function ThemeToggle() {
    const isClient = useIsClient();
    const [override, setOverride] = useState<Theme | null>(null);
    const theme = override ?? (isClient ? storedTheme() : DEFAULT_THEME);

    useEffect(() => {
        if (isClient) applyTheme(theme);
    }, [isClient, theme]);

    const label =
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

    return (
        <Button
            tone="ghost"
            size="sm"
            aria-label={label}
            title={label}
            onClick={() => setOverride(nextTheme(theme))}
        >
            {theme === "dark" ? (
                <Sun className="size-3" strokeWidth={1.5} />
            ) : (
                <Moon className="size-3" strokeWidth={1.5} />
            )}
        </Button>
    );
}
