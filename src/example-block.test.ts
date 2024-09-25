import { test } from "vitest";
import { toAST } from "./mod.js";
test("BlockExample", async ({ expect }) => {
  const input = `====
best example.
====
`;
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "content": [
            "best example.",
          ],
          "context": "example",
          "delimiter": "====",
          "type": "BlockExample",
        },
      ],
      "type": "Document",
    }
  `);
});
