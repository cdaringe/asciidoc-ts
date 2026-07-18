import type { Node } from "ohm-js";

type ASTOperationNode = Node | { toAST(): unknown };

export type ASTExpectation =
  | "array"
  | "record"
  | "semantic"
  | "string"
  | { type: string };

export interface ASTGuards {
  array(value: unknown): boolean;
  record(value: unknown): boolean;
  semantic(value: unknown): boolean;
  string(value: unknown): boolean;
  type(value: unknown, expectedType: string): boolean;
}

export interface ASTReader {
  <T>(node: ASTOperationNode, expectation: ASTExpectation): T;
}

const describeValue = (value: unknown): string => {
  if (value && typeof value === "object" && "type" in value) {
    return `AST node ${String(value.type)}`;
  }
  if (Array.isArray(value)) return "array";
  return typeof value;
};

export const createASTReader = (guards?: ASTGuards): ASTReader => {
  if (!guards) {
    return <T>(node: ASTOperationNode): T => node.toAST() as T;
  }
  return <T>(node: ASTOperationNode, expectation: ASTExpectation): T => {
    const value: unknown = node.toAST();
    const valid = typeof expectation === "object"
      ? guards.type(value, expectation.type)
      : guards[expectation](value);
    if (!valid) {
      const expected = typeof expectation === "object"
        ? `AST node ${expectation.type}`
        : expectation;
      throw new TypeError(
        `Expected ${expected}, received ${describeValue(value)}`,
      );
    }
    return value as T;
  };
};
