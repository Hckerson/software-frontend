"use client";
import { AlertTriangle } from "lucide-react";
import Button from "@/components/common/button";
import { ApiError } from "@/lib/errors/api-error";
import { FALLBACK_ERROR_MESSAGE } from "@/lib/constants";

interface Props {
    error: unknown;
    onRetry?: () => void;
}

const messageFrom = (error: unknown): string => {
    if (error instanceof ApiError) return error.message;
    if (error instanceof Error) return error.message;

    return FALLBACK_ERROR_MESSAGE;
};

export default function ErrorState({ error, onRetry }: Props) {
    return (
        <div className="empty-state" role="alert">
            <AlertTriangle className="text-error size-6" strokeWidth={1.25} />
            <p className="text-text text-sm font-medium">
                We could not load this
            </p>
            <p className="text-text-secondary measure text-xs">
                {messageFrom(error)}
            </p>
            {onRetry && (
                <Button tone="quiet" size="sm" onClick={onRetry}>
                    Try again
                </Button>
            )}
        </div>
    );
}
