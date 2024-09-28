import { describe, test } from "vitest";
import { toAST } from "../mod.js";

describe("Inline Elements", () => {
  test("Sequential InlineElements", async ({ expect }) => {
    const input =
      `This paragraph has *bold*, _italic_, and ${"`"}monospace text, señor${"`"}!`;
    const result = toAST(input);
    expect(result.value).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "content": [
              {
                "content": "This paragraph has",
                "type": "PlainText",
              },
              {
                "content": [
                  {
                    "content": "bold",
                    "type": "PlainText",
                  },
                ],
                "type": "ConstrainedBold",
              },
              {
                "content": ",",
                "type": "PlainText",
              },
              {
                "content": [
                  {
                    "content": "italic",
                    "type": "PlainText",
                  },
                ],
                "type": "UnconstrainedItalic",
              },
              {
                "content": ", and",
                "type": "PlainText",
              },
              {
                "content": {
                  "content": "monospace text, señor",
                  "type": "PlainText",
                },
                "type": "MonospaceText",
              },
              {
                "content": "!",
                "type": "PlainText",
              },
            ],
            "context": "paragraph",
            "type": "BlockParagraph",
          },
        ],
        "type": "Document",
      }
    `);
  });
});
