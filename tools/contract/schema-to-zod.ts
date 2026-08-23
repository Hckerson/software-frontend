import { JsonSchema } from "./openapi-document";

const REF_PREFIX = "#/components/schemas/";

export const refName = (ref: string): string => ref.slice(REF_PREFIX.length);

export const schemaConstName = (name: string): string =>
    `${name[0].toLowerCase()}${name.slice(1)}Schema`;

const enumExpression = (values: (string | number)[]): string =>
    values.every((value) => typeof value === "string")
        ? `z.enum([${values.map((value) => JSON.stringify(value)).join(", ")}])`
        : `z.union([${values.map((value) => `z.literal(${JSON.stringify(value)})`).join(", ")}])`;

export const zodExpression = (schema: JsonSchema): string => {
    if (schema.$ref) return schemaConstName(refName(schema.$ref));
    if (schema.enum) return enumExpression(schema.enum);

    switch (schema.type) {
        case "string":
            return "z.string()";
        case "number":
        case "integer":
            return "z.number()";
        case "boolean":
            return "z.boolean()";
        case "array":
            return `z.array(${schema.items ? zodExpression(schema.items) : "z.unknown()"})`;
        case "object":
            return objectExpression(schema);
        default:
            return "z.unknown()";
    }
};

const objectExpression = (schema: JsonSchema): string => {
    const required = new Set(schema.required ?? []);
    const entries = Object.entries(schema.properties ?? {}).map(
        ([property, value]) => {
            const nullable = value.nullable ? ".nullable()" : "";
            const optional = required.has(property) ? "" : ".optional()";

            return `${JSON.stringify(property)}: ${zodExpression(value)}${nullable}${optional},`;
        },
    );

    return `z.object({${entries.join("")}})`;
};

export const referencedSchemas = (schema: JsonSchema): string[] => {
    const found = schema.$ref ? [refName(schema.$ref)] : [];
    const children = [
        ...(schema.items ? [schema.items] : []),
        ...Object.values(schema.properties ?? {}),
    ];

    return children.reduce(
        (names, child) => [...names, ...referencedSchemas(child)],
        found,
    );
};

export const orderByDependency = (
    schemas: Record<string, JsonSchema>,
): string[] => {
    const ordered: string[] = [];
    const visiting = new Set<string>();

    const visit = (name: string): void => {
        if (ordered.includes(name)) return;

        if (visiting.has(name)) {
            throw new Error(`circular schema reference through '${name}'`);
        }

        visiting.add(name);

        for (const dependency of referencedSchemas(schemas[name])) {
            if (schemas[dependency]) visit(dependency);
        }

        visiting.delete(name);
        ordered.push(name);
    };

    for (const name of Object.keys(schemas)) visit(name);

    return ordered;
};
