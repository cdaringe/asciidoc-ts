import { test } from "vitest";
import { toAST } from "../mod.js";
test("block quote ___ delimiting", async ({ expect }) => {
  const input = `[quote, Albert Einstein]
____
The important thing is not to stop questioning. Curiosity has its own reason for existing.
____
`;
  const result = toAST(input, "Block");
  expect(result.value).toMatchInlineSnapshot(`
    {
      "content": [
        {
          "content": "The important thing is not to stop questioning. Curiosity has its own reason for existing.",
          "type": "PlainText",
        },
      ],
      "context": "quote",
      "delimiter": "____",
      "metadata": {
        "attributes": [
          {
            "name": "quote",
            "type": "AttributeEntry",
          },
          {
            "name": "Albert Einstein",
            "type": "AttributeEntry",
          },
        ],
        "title": [],
      },
      "type": "BlockQuote",
    }
  `);
});
