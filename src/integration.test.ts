import { test } from "vitest";
import { toAST } from "./mod.js";
test("Complex Document", async ({ expect }) => {
  const input = `
= Main Header

== Section 1

This is a paragraph with *bold* and _italic_ text.

* List item 1
* List item 2
** Nested item

[source,javascript]
----
function greet(name) {
console.log(\`Hello, ${"\${name}"}!\`);
}
----

https://example.com[Visit Example]

NOTE: This is an admonition.
`;
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "type": "BlankLine",
        },
        {
          "content": [
            {
              "content": "Main Header",
              "type": "PlainText",
            },
          ],
          "level": 1,
          "type": "Header",
        },
        {
          "content": [
            {
              "content": "Section 1",
              "type": "PlainText",
            },
          ],
          "level": 2,
          "type": "Header",
        },
        {
          "content": [
            {
              "content": "This is a paragraph with ",
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
              "content": "and ",
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
              "content": "text.",
              "type": "PlainText",
            },
          ],
          "type": "Paragraph",
        },
        {
          "items": [
            {
              "content": [
                {
                  "content": "List item 1",
                  "type": "PlainText",
                },
              ],
              "depth": 0,
              "type": "UnorderedListItem",
            },
            {
              "content": [
                {
                  "content": "List item 2",
                  "type": "PlainText",
                },
              ],
              "depth": 0,
              "type": "UnorderedListItem",
            },
            {
              "content": [
                {
                  "content": "Nested item",
                  "type": "PlainText",
                },
              ],
              "depth": 1,
              "type": "UnorderedListItem",
            },
          ],
          "type": "UnorderedList",
        },
        {
          "content": "function greet(name) {
    console.log(\`Hello, \${name}!\`);
    }",
          "delimited": true,
          "metadata": {
            "attributes": [
              {
                "name": "source",
                "type": "AttributeEntry",
              },
              {
                "name": "javascript",
                "type": "AttributeEntry",
              },
            ],
          },
          "type": "CodeBlock",
        },
        {
          "content": [
            {
              "attributes": [
                {
                  "name": "Visit Example",
                  "type": "AttributeEntry",
                },
              ],
              "scheme": "https",
              "type": "UrlMacro",
              "url": "https://example.com",
            },
          ],
          "type": "Paragraph",
        },
        {
          "admonitionType": "NOTE",
          "content": "This is an admonition.",
          "type": "Admonition",
        },
      ],
      "type": "Document",
    }
  `);
});
