import {
    CallExpression,
    Identifier,
    Node,
    SourceFile,
    SyntaxKind,
} from "ts-morph";

export const TRANSPORT_MODULE = "@/lib/api-client";
export const HOOKS_DIR = "lib/hooks";
export const READ_METHOD = "get";

export const isWithinHooksDir = (filePath: string): boolean =>
    filePath.replace(/\\/g, "/").includes(`/${HOOKS_DIR}/`);

export const rootIdentifier = (node: Node): Identifier | undefined => {
    let current = node;

    while (Node.isPropertyAccessExpression(current)) {
        current = current.getExpression();
    }

    return Node.isIdentifier(current) ? current : undefined;
};

export const declaringModule = (identifier: Identifier): string | undefined =>
    identifier
        .getSymbol()
        ?.getDeclarations()
        .at(0)
        ?.getFirstAncestorByKind(SyntaxKind.ImportDeclaration)
        ?.getModuleSpecifierValue();

export const transportMethod = (call: CallExpression): string | undefined => {
    const expression = call.getExpression();

    return Node.isPropertyAccessExpression(expression)
        ? expression.getName()
        : undefined;
};

export const isTransportCall = (call: CallExpression): boolean => {
    const root = rootIdentifier(call.getExpression());

    return root !== undefined && declaringModule(root) === TRANSPORT_MODULE;
};

export const findTransportCalls = (file: SourceFile): CallExpression[] =>
    file
        .getDescendantsOfKind(SyntaxKind.CallExpression)
        .filter(isTransportCall);

export const referencedIdentifiers = (call: CallExpression): Identifier[] =>
    call
        .getArguments()
        .flatMap((argument) =>
            Node.isIdentifier(argument)
                ? [argument]
                : argument.getDescendantsOfKind(SyntaxKind.Identifier),
        )
        .filter((identifier) => {
            const parent = identifier.getParent();

            return (
                !Node.isPropertyAccessExpression(parent) ||
                parent.getNameNode() !== identifier
            );
        });

export const enclosingFunction = (call: CallExpression): Node | undefined =>
    call.getFirstAncestor(
        (ancestor) =>
            Node.isFunctionDeclaration(ancestor) ||
            Node.isArrowFunction(ancestor) ||
            Node.isFunctionExpression(ancestor),
    );
