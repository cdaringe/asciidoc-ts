import { test } from "vitest";
import { toAST } from "../mod.js";
test.only("Unordered List", async ({ expect }) => {
  const input = `
* Item 1 **bold**
* Item 2 _italic_
* Item 3 https://foo.org[fooish, aria-role=quz]
  `.trim();
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "items": [
            {
              "content": [
                {
                  "content": "Item 1 ",
                  "type": "PlainText",
                },
                {
                  "content": {
                    "content": [
                      {
                        "content": "bold",
                        "type": "PlainText",
                      },
                    ],
                    "type": "ConstrainedBold",
                  },
                  "type": "UnconstrainedBold",
                },
              ],
              "depth": 0,
              "type": "UnorderedListItem",
            },
            {
              "content": [
                {
                  "content": "Item 2 ",
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
              "type": "UnorderedListItem",
            },
            {
              "content": [
                {
                  "content": "Item 3 ",
                  "type": "PlainText",
                },
                {
                  "attributes": [
                    {
                      "name": "fooish",
                      "type": "AttributeEntry",
                    },
                    {
                      "name": "aria-role=quz",
                      "type": "AttributeEntry",
                    },
                  ],
                  "scheme": "https",
                  "type": "UrlMacro",
                  "url": "https://foo.org",
                },
              ],
              "depth": 0,
              "type": "UnorderedListItem",
            },
          ],
          "type": "UnorderedList",
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
  expect(result).toMatchInlineSnapshot();
});
