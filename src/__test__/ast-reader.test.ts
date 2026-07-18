import { describe, expect, test } from "vitest";
import { createASTReader } from "../ast-reader.js";
import { guards } from "./parser.js";

const nodeReturning = (value: unknown) => ({ toAST: () => value });

describe("AST reader guards", () => {
  const readAST = createASTReader(guards);

  test("accepts matching values", () => {
    expect(readAST(nodeReturning("text"), "string")).toBe("text");
    expect(readAST(nodeReturning([]), "array")).toEqual([]);
    expect(
      readAST(nodeReturning({ type: "PlainText" }), { type: "PlainText" }),
    ).toEqual({ type: "PlainText" });
  });

  test("reports mismatched values", () => {
    expect(() => readAST(nodeReturning({}), "array")).toThrow(
      "Expected array, received object",
    );
    expect(() =>
      readAST(nodeReturning({ type: "Link" }), { type: "PlainText" })
    ).toThrow("Expected AST node PlainText, received AST node Link");
  });

  test("unchecked reading returns the same value", () => {
    const readUncheckedAST = createASTReader();
    const value = { malformed: true };
    expect(readUncheckedAST(nodeReturning(value), { type: "Document" })).toBe(
      value,
    );
  });
});
