import type { ASTGuards } from "../ast-reader.js";
import { createParser } from "../ast.js";
import { verifyRules } from "../init.js";

const isSemanticValue = (value: unknown): boolean =>
  typeof value === "string" ||
  (Array.isArray(value) && value.every(isSemanticValue)) ||
  (value !== null && typeof value === "object");

export const guards: ASTGuards = {
  array: Array.isArray,
  record: (value) => value !== null && typeof value === "object",
  semantic: isSemanticValue,
  string: (value) => typeof value === "string",
  type: (value, expectedType) =>
    value !== null && typeof value === "object" && "type" in value &&
    value.type === expectedType,
};

const parser = createParser({ guards });
verifyRules(parser.semantics);

export const toAST = parser.toAST;
