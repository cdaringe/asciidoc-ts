import { test } from "vitest";
import { toAST } from "../mod.js";

test("BlockExample", async ({ expect }) => {
  const input = `====
best example.
====
`;
  const result = toAST(input);
  expect(result.value).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "content": [
            {
              "content": "best example.",
              "type": "PlainText",
            },
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
