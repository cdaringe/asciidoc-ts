import { test } from "vitest";
import { toAST } from "../mod.js";
test("BlockAdmonition - basic", async ({ expect }) => {
  const input = `NOTE: This is an admonition.
`;
  expect(toAST(input, "Block")).toMatchInlineSnapshot(`
    {
      "ok": true,
      "value": {
        "admonitionType": "NOTE",
        "content": {
          "content": "This is an admonition.",
          "type": "PlainText",
        },
        "context": "admonition",
        "type": "BlockAdmonition",
      },
    }
  `);
});
