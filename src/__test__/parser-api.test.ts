import { expect, expectTypeOf, test } from "vitest";
import type { MatchResult } from "ohm-js";
import { createParser, parse } from "../ast.js";
import type { Document, SemanticValue } from "../ast-types.js";
import type { Result } from "../result.js";
import { guards, toAST as checkedToAST } from "./parser.js";

test("checked and unchecked parsers have identical results", () => {
  const input = "A paragraph with *bold* text.";
  const unchecked = parse(input);
  const checked = checkedToAST(input);
  expect(checked).toEqual(unchecked);
});

test("parse is the default API and exposes both result types", () => {
  const parser = createParser({ guards });
  expectTypeOf(parser.parse("text")).toEqualTypeOf<
    Result<Document, MatchResult>
  >();
  expectTypeOf(parser.parse("text", "Block")).toEqualTypeOf<
    Result<SemanticValue, MatchResult>
  >();
  expect(parser.toAST).toBe(parser.parse);
});
