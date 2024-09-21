import { describe, expect, test } from "vitest";
import { toAST } from "./mod.js";

test("Parse Header (without \\n is PlainText)", async ({ expect }) => {
  const input = `= Main Header`;
  const result = toAST(input);
  expect(result).toMatchSnapshot();
});

test("Parse Header (with \\n)", async ({ expect }) => {
  const input = `== Main Header\n `;
  const result = toAST(input);
  expect(result).toMatchSnapshot();
});
