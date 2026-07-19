import { test } from "vitest";
import { toAST } from "./parser.js";
test("block quote ___ delimiting", async ({ expect }) => {
  const input = `[quote, Albert Einstein, Relativity]
____
The important thing is not to stop questioning. Curiosity has its own reason for existing.
____
`;
  const result = toAST(input, "Block");
  expect(result.value).toMatchInlineSnapshot(`
    {
      "content": [
        {
          "content": [
            {
              "content": "The important thing is not to stop questioning. Curiosity has its own reason for existing.",
              "type": "PlainText",
            },
          ],
          "context": "paragraph",
          "type": "BlockParagraph",
        },
      ],
      "context": "quote",
      "delimiter": "____",
      "metadata": {
        "attributes": [
          {
            "name": "quote",
            "type": "AttributeStyle",
          },
          {
            "name": "Albert Einstein",
            "type": "AttributeAuthor",
          },
          {
            "name": "Relativity",
            "type": "AttributeCitation",
          },
        ],
        "title": [],
      },
      "type": "BlockQuote",
    }
  `);
});
