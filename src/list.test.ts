import { describe, expect, test } from "vitest";
import { toAST } from "./mod.js";

test.only("Unordered List", async ({ expect }) => {
  const input = `
* Item 1 **bold**
* Item 2 _italic_
* Item 3 https://foo.org[fooish, aria-role=quz]
  `;
  const result = toAST(input);
  expect(result).toMatchSnapshot();
});

test("Ordered List", async ({ expect }) => {
  const input = `
1. First item
2. Second item
  `;
  const result = toAST(input);
  expect(result).toMatchSnapshot();
});
