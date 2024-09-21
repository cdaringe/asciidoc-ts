import { describe, expect, test } from "vitest";
import { toAST } from "./mod.js";

test("ListingBlock", async ({ expect }) => {
  const input = `
[foo, bar]
baz

`;
  const result = toAST(input);
  expect(result).toMatchSnapshot();
});

test("ListingBlock - delimited", async ({ expect }) => {
  const input = `
[foo, bar]
----
newlines are


ok
----
`;
  const result = toAST(input);
  expect(result).toMatchSnapshot();
});

test("CodeBlock", async ({ expect }) => {
  const input = `
[source, js]
----
foo();
----
`;
  const result = toAST(input);
  expect(result).toMatchSnapshot();
});
