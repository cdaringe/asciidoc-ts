import { test } from "vitest";
import { toAST } from "../mod.js";
test("Complex Document", async ({ expect }) => {
  const input = `
= Main Header

== Section 1

This is a paragraph with *bold* and _italic_ text.

* List item with URL https://foo.bar[baz]
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
`.trimStart();
  const result = toAST(input);
  expect(result.value).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "content": [
            {
              "content": "Main Header",
              "type": "PlainText",
            },
          ],
          "context": "section",
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
          "context": "section",
          "level": 2,
          "type": "Header",
        },
        {
          "content": [
            {
              "content": "This is a paragraph with",
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
              "content": "and",
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
          "context": "paragraph",
          "type": "BlockParagraph",
        },
        {
          "content": [
            {
              "content": [
                {
                  "content": "List item with URL https://foo.bar[baz]",
                  "type": "PlainText",
                },
              ],
              "depth": 0,
              "type": "ListItem",
            },
            {
              "content": [
                {
                  "content": "List item 2",
                  "type": "PlainText",
                },
              ],
              "depth": 0,
              "type": "ListItem",
            },
            {
              "content": [
                {
                  "content": "Nested item",
                  "type": "PlainText",
                },
              ],
              "depth": 1,
              "type": "ListItem",
            },
          ],
          "context": "ulist",
          "ordered": false,
          "type": "BlockList",
        },
        {
          "content": [
            {
              "content": "function greet(name)",
              "type": "PlainText",
            },
            {
              "content": "{",
              "type": "PlainText",
            },
            {
              "content": "console.log(\`Hello, \${name}!\`);",
              "type": "PlainText",
            },
            {
              "content": "}",
              "type": "PlainText",
            },
          ],
          "context": "source",
          "delimiter": "----",
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
            "title": [],
          },
          "type": "BlockSource",
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
          "context": "paragraph",
          "type": "BlockParagraph",
        },
        {
          "admonitionType": "NOTE",
          "content": {
            "content": "This is an admonition.",
            "type": "PlainText",
          },
          "context": "admonition",
          "type": "BlockAdmonition",
        },
      ],
      "type": "Document",
    }
  `);
  throw new Error("list item with url in it is biffed");
});
