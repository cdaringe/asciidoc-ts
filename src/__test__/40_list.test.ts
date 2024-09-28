import { describe, test } from "vitest";
import { toAST } from "../mod.js";

describe("List", () => {
  test("Unordered List", async ({ expect }) => {
    const input = `
* Item 1 **bold**
* Item 2 _italic_
  `.trim();
    const result = toAST(input);
    expect(result.value).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "content": [
              {
                "content": [
                  {
                    "content": "Item 1",
                    "type": "PlainText",
                  },
                  {
                    "content": [
                      {
                        "content": [
                          {
                            "content": "bold",
                            "type": "PlainText",
                          },
                        ],
                        "type": "ConstrainedBold",
                      },
                    ],
                    "type": "ConstrainedBold",
                  },
                ],
                "depth": 0,
                "type": "ListItem",
              },
              {
                "content": [
                  {
                    "content": "Item 2",
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
                ],
                "depth": 0,
                "type": "ListItem",
              },
            ],
            "context": "ulist",
            "ordered": false,
            "type": "BlockList",
          },
        ],
        "type": "Document",
      }
    `);
  });
  test("Ordered List", async ({ expect }) => {
    const input = `
1. First item
2. Second item
  `;
    const result = toAST(input);
    expect(result.value).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "content": [
              {
                "content": "
      ",
                "type": "PlainText",
              },
            ],
            "context": "blank_line",
            "type": "BlankLine",
          },
          {
            "content": [
              {
                "content": [
                  {
                    "content": "First item",
                    "type": "PlainText",
                  },
                ],
                "depth": 1,
                "type": "OrderedListItem",
              },
              {
                "content": [
                  {
                    "content": "Second item",
                    "type": "PlainText",
                  },
                ],
                "depth": 1,
                "type": "OrderedListItem",
              },
            ],
            "context": "olist",
            "ordered": true,
            "type": "BlockList",
          },
        ],
        "type": "Document",
      }
    `);
  });
});
