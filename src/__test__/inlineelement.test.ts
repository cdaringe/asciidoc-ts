import { test } from "vitest";
import { toAST } from "../mod.js";
test("Sequential InlineElements", async ({ expect }) => {
  const input =
    `This paragraph has *bold*, _italic_, and ${"`"}monospace${"`"} text.`;
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "content": [
            {
              "content": "This paragraph has ",
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
              "content": ", ",
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
              "content": ", and ",
              "type": "PlainText",
            },
            {
              "content": "monospace",
              "type": "MonospaceText",
            },
            {
              "content": "text.",
              "type": "PlainText",
            },
          ],
          "type": "Paragraph",
        },
      ],
      "type": "Document",
    }
  `);
});
