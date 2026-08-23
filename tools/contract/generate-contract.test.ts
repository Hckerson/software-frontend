import { describe, expect, it } from "vitest";
import { openApiDocument } from "./openapi-document";
import {
    routeBuilder,
    routeKey,
    routesFile,
    schemasFile,
} from "./generate-contract";
import { orderByDependency, zodExpression } from "./schema-to-zod";

describe("schema-to-zod", () => {
    it("marks properties outside required as optional", () => {
        expect(
            zodExpression({
                type: "object",
                properties: { id: { type: "string" }, bio: { type: "string" } },
                required: ["id"],
            }),
        ).toBe('z.object({"id": z.string(),"bio": z.string().optional(),})');
    });

    it("emits enums, arrays, numbers and nullables", () => {
        expect(zodExpression({ type: "string", enum: ["ADMIN", "USER"] })).toBe(
            'z.enum(["ADMIN", "USER"])',
        );
        expect(
            zodExpression({ type: "array", items: { type: "integer" } }),
        ).toBe("z.array(z.number())");
        expect(
            zodExpression({
                type: "object",
                properties: { avatar: { type: "string", nullable: true } },
                required: ["avatar"],
            }),
        ).toBe('z.object({"avatar": z.string().nullable(),})');
    });

    it("references other schemas by their generated const name", () => {
        expect(
            zodExpression({ $ref: "#/components/schemas/CreateUserDto" }),
        ).toBe("createUserDtoSchema");
    });

    it("orders schemas so references are declared first", () => {
        expect(
            orderByDependency({
                Wrapper: {
                    type: "object",
                    properties: { user: { $ref: "#/components/schemas/User" } },
                },
                User: {
                    type: "object",
                    properties: { id: { type: "string" } },
                },
            }),
        ).toEqual(["User", "Wrapper"]);
    });

    it("rejects circular references instead of emitting broken output", () => {
        expect(() =>
            orderByDependency({
                A: { properties: { b: { $ref: "#/components/schemas/B" } } },
                B: { properties: { a: { $ref: "#/components/schemas/A" } } },
            }),
        ).toThrow(/circular/);
    });
});

describe("routes", () => {
    it("derives a resource-prefixed key from the operation id", () => {
        expect(routeKey("UsersController_findOne")).toBe("usersFindOne");
        expect(routeKey("AuthController_login")).toBe("authLogin");
    });

    it("turns path templates into typed builders", () => {
        expect(routeBuilder("/api/users")).toBe('() => "/api/users"');
        expect(routeBuilder("/api/users/{id}")).toBe(
            "(id: string) => `/api/users/${id}`",
        );
    });

    it("emits one builder per operation", () => {
        const file = routesFile({
            "/api/users": { post: { operationId: "UsersController_create" } },
            "/api/users/{id}": {
                get: { operationId: "UsersController_findOne" },
            },
        });

        expect(file).toContain('usersCreate: () => "/api/users",');
        expect(file).toContain(
            "usersFindOne: (id: string) => `/api/users/${id}`,",
        );
    });
});

describe("schemasFile", () => {
    it("declares a schema const and an inferred type per component", () => {
        const file = schemasFile({
            LoginDto: {
                type: "object",
                properties: { email: { type: "string" } },
                required: ["email"],
            },
        });

        expect(file).toContain('import { z } from "zod";');
        expect(file).toContain(
            'export const loginDtoSchema = z.object({"email": z.string(),});',
        );
        expect(file).toContain(
            "export type LoginDto = z.infer<typeof loginDtoSchema>;",
        );
    });
});

describe("openApiDocument", () => {
    it("rejects a document without paths", () => {
        expect(() => openApiDocument.parse({ components: {} })).toThrow();
    });
});
