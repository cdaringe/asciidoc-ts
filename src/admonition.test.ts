import { test } from "vitest";
import { toAST } from "./mod.js";

test("Admonition - basic", async ({ expect }) => {
  const input = `NOTE: This is an admonition.`;
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "admonitionType": "NOTE",
          "content": "This is an admonition.",
          "type": "Admonition",
        },
      ],
      "type": "Document",
    }
  `);
});
