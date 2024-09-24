import { test } from "vitest";
import { toAST } from "./mod.js";
test("ExampleBlock", async ({ expect }) => {
  const input = `====
best example.
====
`;
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "content": "best example.",
          "delimited": true,
          "type": "ExampleBlock",
        },
      ],
      "type": "Document",
    }
  `);
});
