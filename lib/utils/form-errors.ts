import type { ZodError, ZodType } from "zod";

export type FieldErrors = Record<string, string>;

export const fieldErrors = (error: ZodError): FieldErrors => {
    const collected: FieldErrors = {};

    for (const issue of error.issues) {
        const key = issue.path.join(".");

        if (key && !collected[key]) collected[key] = issue.message;
    }

    return collected;
};

export const validate = <T>(
    schema: ZodType<T>,
    input: unknown,
): { values: T; errors: null } | { values: null; errors: FieldErrors } => {
    const result = schema.safeParse(input);

    return result.success
        ? { values: result.data, errors: null }
        : { values: null, errors: fieldErrors(result.error) };
};
