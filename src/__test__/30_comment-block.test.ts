import { test } from "vitest";
import { toAST } from "../mod.js";
test("Comment", async ({ expect }) => {
  const input = `////
totally cool comment.

can you EVEN **believe** it?

_I can!_
////
`;
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "ok": true,
      "value": {
        "blocks": [
          {
            "content": [
              {
                "content": "totally cool comment.",
                "type": "PlainText",
              },
              {
                "content": "
    ",
                "type": "PlainText",
              },
              {
                "content": "can you EVEN **believe** it?",
                "type": "PlainText",
              },
              {
                "content": "
    ",
                "type": "PlainText",
              },
              {
                "content": [
                  {
                    "content": "I can!",
                    "type": "PlainText",
                  },
                ],
                "type": "UnconstrainedItalic",
              },
            ],
            "context": "comment",
            "delimiter": "////",
            "type": "BlockComment",
          },
        ],
        "type": "Document",
      },
    }
  `);
});
