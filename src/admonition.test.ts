import { describe, expect, test } from "vitest";
import { toAST } from "./mod.js";


test("Admonition - basic", async ({ expect }) => {
  const input = `NOTE: This is an admonition.`;
  const result = toAST(input);
  expect(result).toMatchSnapshot();
});

