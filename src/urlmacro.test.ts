import { describe, expect, test } from "vitest";
import { toAST } from "./mod.js";

test("Parse URL Macro", async ({ expect }) => {
  const input = `https://example.com[foo, bar]`;
  const result = toAST(input);
  expect(result).toMatchSnapshot();
});
