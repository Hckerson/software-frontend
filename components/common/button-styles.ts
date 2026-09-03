export const BUTTON_BASE = [
    "smooth font-body inline-flex cursor-pointer items-center justify-center border font-medium select-none",
    "focus-visible:ring-accent focus-visible:ring-2 focus-visible:outline-none",
    "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

export const BUTTON_SIZES = {
    sm: "h-8 gap-1.5 rounded-md px-3 text-xs",
    md: "h-9 gap-2 rounded-md px-4 text-xs",
    lg: "h-10 gap-2 rounded-lg px-5 text-sm",
    xl: "h-11 gap-2 rounded-lg px-6 text-sm",
} as const;

export const BUTTON_TONES = {
    accent: "border-accent bg-accent text-text-inverse hover:bg-accent-dark",
    quiet: "border-border bg-background-muted text-text hover:border-border-dark",
    ghost: "border-transparent text-text-secondary hover:bg-background-muted hover:text-text",
    danger: "border-error bg-error text-text-inverse hover:opacity-90",
} as const;
