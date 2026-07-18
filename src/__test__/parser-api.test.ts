import { expect, expectTypeOf, test } from "vitest";
import type { MatchResult } from "ohm-js";
import { createParser } from "../ast.js";
import type { Document, SemanticValue } from "../ast-types.js";
import type { Result } from "../result.js";
import { guards, toAST as checkedToAST } from "./parser.js";

test("checked and unchecked parsers have identical results", () => {
  const input = "A paragraph with *bold* text.";
  const unchecked = createParser().toAST(input);
  const checked = checkedToAST(input);
  expect(checked).toEqual(unchecked);
});

test("toAST overloads expose document and start-rule result types", () => {
  const parser = createParser({ guards });
  expectTypeOf(parser.toAST("text")).toEqualTypeOf<
    Result<Document, MatchResult>
  >();
  expectTypeOf(parser.toAST("text", "Block")).toEqualTypeOf<
    Result<SemanticValue, MatchResult>
  >();
});
