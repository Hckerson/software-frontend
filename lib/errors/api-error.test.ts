import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/errors/api-error";
import { FALLBACK_ERROR_MESSAGE, HTTP_STATUS } from "@/lib/constants";
import type { AxiosError } from "axios";
import type { ApiErrorBody } from "@/lib/types";

const errorBody = (overrides: Partial<ApiErrorBody>): ApiErrorBody => ({
    statusCode: 500,
    message: "",
    error: "Error",
    path: "/api",
    timestamp: "2026-09-20T00:00:00.000Z",
    ...overrides,
});

const axiosError = (
    response?: { status: number; data: ApiErrorBody },
    message = "",
): AxiosError<ApiErrorBody> =>
    ({ response, message }) as AxiosError<ApiErrorBody>;

describe("ApiError.from", () => {
    it("takes the message and path the API reported", () => {
        const error = ApiError.from(
            axiosError({
                status: 404,
                data: errorBody({
                    message: "Invoice not found",
                    path: "/api/invoices/1",
                }),
            }),
        );

        expect(error.message).toBe("Invoice not found");
        expect(error.statusCode).toBe(404);
        expect(error.path).toBe("/api/invoices/1");
    });

    it("joins the array of messages class-validator returns", () => {
        const error = ApiError.from(
            axiosError({
                status: 400,
                data: errorBody({
                    message: ["email must be an email", "too short"],
                }),
            }),
        );

        expect(error.message).toBe("email must be an email, too short");
    });

    it("reports a network failure as status zero", () => {
        const error = ApiError.from(axiosError(undefined, "Network Error"));

        expect(error.statusCode).toBe(HTTP_STATUS.networkError);
        expect(error.message).toBe("Network Error");
    });

    it("falls back when neither the body nor axios says anything", () => {
        expect(ApiError.from(axiosError(undefined)).message).toBe(
            FALLBACK_ERROR_MESSAGE,
        );
    });

    it("stays an Error so error boundaries and instanceof still work", () => {
        const error = ApiError.from(axiosError(undefined, "boom"));

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe("ApiError");
    });
});

describe("isUnauthorized", () => {
    it("is true only for 401", () => {
        expect(new ApiError("no", 401).isUnauthorized).toBe(true);
        expect(new ApiError("no", 403).isUnauthorized).toBe(false);
    });
});
