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
                "depth": 0,
                "type": "OrderedListItem",
              },
              {
                "content": [
                  {
                    "content": "Second item",
                    "type": "PlainText",
                  },
                ],
                "depth": 0,
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

  test("infers levels from marker changes instead of marker length", async ({ expect }) => {
    const input = `* Level 1
- Level 2 using a different marker
*** Level 3 using a non-sequential length
- Back to level 2
* Back to level 1`;

    const result = toAST(input);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const list = result.value.blocks[0];
    expect(list).toMatchObject({
      content: [
        { depth: 0 },
        { depth: 1 },
        { depth: 2 },
        { depth: 1 },
        { depth: 0 },
      ],
      context: "ulist",
    });
  });

  test("parses nested ordered list markers", async ({ expect }) => {
    const result = toAST(`. Level 1
.. Level 2
.... Level 3 using a non-sequential length
.. Back to level 2
. Back to level 1`);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.blocks[0]).toMatchObject({
      content: [
        { depth: 0 },
        { depth: 1 },
        { depth: 2 },
        { depth: 1 },
        { depth: 0 },
      ],
      context: "olist",
    });
  });

  test("recognizes a single-letter explicit ordered marker", async ({ expect }) => {
    const result = toAST("P. O. Box");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.blocks[0]).toMatchObject({
      content: [{ depth: 0, type: "OrderedListItem" }],
      context: "olist",
    });
  });

  test("an empty attribute reference escapes an ordered list marker", async ({ expect }) => {
    const result = toAST("P.{empty}O. Box");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.blocks[0]).toEqual({
      content: [{ content: "P.{empty}O. Box", type: "PlainText" }],
      context: "paragraph",
      type: "BlockParagraph",
    });
  });
});
