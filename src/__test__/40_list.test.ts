import { describe, test } from "vitest";
import { toAST } from "./parser.js";

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
  test("Unordered List with URL", async ({ expect }) => {
    const result = toAST("* before_text https://foo.bar[baz] after_text");

    expect(result.value).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "content": [
              {
                "content": [
                  {
                    "content": "before_text",
                    "type": "PlainText",
                  },
                  {
                    "attributes": [
                      {
                        "name": "baz",
                        "type": "AttributePositional",
                      },
                    ],
                    "scheme": "https",
                    "type": "UrlMacro",
                    "url": "https://foo.bar",
                  },
                  {
                    "content": "after_text",
                    "type": "PlainText",
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
