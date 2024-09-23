import { describe, expect, test } from "vitest";
import { toAST } from "./mod.js";

test("Complex Document", async ({ expect }) => {
  const input = `
= Main Header

== Section 1

This is a paragraph with *bold* and _italic_ text.

* List item 1
* List item 2
** Nested item

[source,javascript]
----
function greet(name) {
console.log(\`Hello, ${"\${name}"}!\`);
}
----

https://example.com[Visit Example]

NOTE: This is an admonition.
`;
  const result = toAST(input);
  expect(result).toMatchSnapshot();
});
