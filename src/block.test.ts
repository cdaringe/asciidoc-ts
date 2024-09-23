import { describe, expect, test } from "vitest";
import { toAST } from "./mod.js";

test("Parse block with metadata", async ({ expect }) => {
  const input = `.Block Title
[#id, .role]
This is a paragraph with metadata.`.trimStart();
  const result = toAST(input);
  expect(result).toMatchSnapshot();
});

test("Parse paragraph block", async ({ expect }) => {
  const input = `This is a simple paragraph block.
It can span multiple lines.`;
  const result = toAST(input);
  expect(result).toMatchSnapshot();
});

test("Parse header block", async ({ expect }) => {
  const input = `== Section Header`;
  const result = toAST(input);
  expect(result).toMatchSnapshot();
});

test("Parse listing block", async ({ expect }) => {
  const input = `[source,javascript]
----
function hello() {
  console.log("Hello, world!");
}
----`;
  const result = toAST(input);
  expect(result).toMatchSnapshot();
});

test.skip("Parse block quote", async ({ expect }) => {
  const input = `[quote, Albert Einstein]
____
The important thing is not to stop questioning. Curiosity has its own reason for existing.
____`;
  const result = toAST(input);
  expect(result).toMatchSnapshot();
});
