import { FALLBACK_ERROR_MESSAGE, HTTP_STATUS } from "@/lib/constants";
import type { AxiosError } from "axios";
import type { ApiErrorBody } from "@/lib/types";

const readMessage = (
    body: ApiErrorBody | undefined,
    fallback: string,
): string => {
    if (!body?.message) return fallback;
    return Array.isArray(body.message) ? body.message.join(", ") : body.message;
};

export class ApiError extends Error {
    readonly statusCode: number;
    readonly path?: string;

    constructor(message: string, statusCode: number, path?: string) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.path = path;
    }

    static from(error: AxiosError<ApiErrorBody>): ApiError {
        const body = error.response?.data;
        return new ApiError(
            readMessage(body, error.message || FALLBACK_ERROR_MESSAGE),
            error.response?.status ?? HTTP_STATUS.networkError,
            body?.path,
        );
    }

    get isUnauthorized(): boolean {
        return this.statusCode === HTTP_STATUS.unauthorized;
    }
}
