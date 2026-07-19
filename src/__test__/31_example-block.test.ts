import { test } from "vitest";
import { toAST } from "./parser.js";

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
              "content": [
                {
                  "content": "best example.",
                  "type": "PlainText",
                },
              ],
              "context": "paragraph",
              "type": "BlockParagraph",
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

test("compound blocks contain independently parsed child blocks", async ({ expect }) => {
  const input = `====
First paragraph.

NOTE: A child admonition.

****
Sidebar paragraph.
****
====`;

  const result = toAST(input);

  expect(result.ok).toBe(true);
  if (!result.ok) return;
  const example = result.value.blocks[0];
  expect(example).toMatchObject({
    context: "example",
    content: [
      { context: "paragraph", type: "BlockParagraph" },
      { context: "admonition", type: "BlockAdmonition" },
      {
        context: "sidebar",
        content: [{ context: "paragraph", type: "BlockParagraph" }],
        type: "BlockSidebar",
      },
    ],
    type: "BlockExample",
  });
});

test("open blocks use the open context", async ({ expect }) => {
  const result = toAST("--\nA paragraph.\n--");

  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.value.blocks[0]).toMatchObject({
    context: "open",
    content: [{ context: "paragraph", type: "BlockParagraph" }],
    type: "BlockOpen",
  });
});

test("non-default congruent fence lengths", async ({ expect }) => {
  const result = toAST("=====\nA five-character example.\n=====");
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.value.blocks[0]).toMatchObject({
    context: "example",
    content: [{ context: "paragraph", type: "BlockParagraph" }],
    delimiter: "=====",
    type: "BlockExample",
  });
});
