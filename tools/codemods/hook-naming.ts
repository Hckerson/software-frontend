import { Node } from "ts-morph";

const words = (value: string): string[] =>
    value
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean);

export const pascalCase = (value: string): string =>
    words(value)
        .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
        .join("");

export const kebabCase = (value: string): string =>
    words(value)
        .map((word) => word.toLowerCase())
        .join("-");

export const deriveResource = (
    argument: Node | undefined,
    fallback: string,
): string => {
    if (Node.isStringLiteral(argument)) {
        const segment = argument
            .getLiteralValue()
            .split("/")
            .filter(Boolean)
            .at(0);

        return segment ?? fallback;
    }

    const expression = Node.isCallExpression(argument)
        ? argument.getExpression()
        : argument;

    if (Node.isPropertyAccessExpression(expression)) {
        const owner = expression.getExpression();

        return Node.isPropertyAccessExpression(owner)
            ? owner.getName()
            : expression.getName();
    }

    return fallback;
};

export const hookName = (resource: string): string =>
    `use${pascalCase(resource)}`;

export const hookFileName = (resource: string): string =>
    `use-${kebabCase(resource)}.ts`;
