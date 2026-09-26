import { z } from "zod";

export interface JsonSchema {
    $ref?: string;
    type?: string;
    format?: string;
    enum?: (string | number)[];
    items?: JsonSchema;
    properties?: Record<string, JsonSchema>;
    required?: string[];
    nullable?: boolean;
}

const jsonSchema: z.ZodType<JsonSchema> = z.lazy(() =>
    z.object({
        $ref: z.string().optional(),
        type: z.string().optional(),
        format: z.string().optional(),
        enum: z.array(z.union([z.string(), z.number()])).optional(),
        items: jsonSchema.optional(),
        properties: z.record(z.string(), jsonSchema).optional(),
        required: z.array(z.string()).optional(),
        nullable: z.boolean().optional(),
    }),
);

const operation = z.object({ operationId: z.string().optional() });

export const openApiDocument = z.object({
    paths: z.record(z.string(), z.record(z.string(), operation)),
    components: z
        .object({ schemas: z.record(z.string(), jsonSchema).optional() })
        .optional(),
});

export type OpenApiDocument = z.infer<typeof openApiDocument>;
