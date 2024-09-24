import { test } from "vitest";
import { toAST } from "./mod.js";
test("Parse block with metadata", async ({ expect }) => {
  const input = `.Block Title
[#id, .role]
This is a paragraph with metadata.`.trimStart();
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "content": [
            {
              "content": "This is a paragraph with metadata.",
              "type": "PlainText",
            },
          ],
          "metadata": {
            "attributes": [
              {
                "name": "#id",
                "type": "AttributeEntry",
              },
              {
                "name": ".role",
                "type": "AttributeEntry",
              },
            ],
            "title": "Block Title",
          },
          "type": "Paragraph",
        },
      ],
      "type": "Document",
    }
  `);
});
test("Parse paragraph block", async ({ expect }) => {
  const input = `This is a simple paragraph block.
It can span multiple lines.`;
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "content": [
            {
              "content": "This is a simple paragraph block.",
              "type": "PlainText",
            },
            {
              "content": "It can span multiple lines.",
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
test("Parse header block", async ({ expect }) => {
  const input = `== Section Header`;
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "content": [
            {
              "content": "Section Header",
              "type": "PlainText",
            },
          ],
          "level": 2,
          "type": "Header",
        },
      ],
      "type": "Document",
    }
  `);
});
test("Parse listing block", async ({ expect }) => {
  const input = `[source,javascript]
----
function hello() {
  console.log("Hello, world!");
}
----`;
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "content": "function hello() {
      console.log("Hello, world!");
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
      ],
      "type": "Document",
    }
  `);
});
