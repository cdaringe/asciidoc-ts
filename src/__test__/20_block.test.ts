import { describe, test } from "vitest";
import { toAST } from "../mod.js";
describe("block", () => {
  test("Parse block with metadata", async ({ expect }) => {
    const input = `.Block Title
[#id, .role]
This is a paragraph with metadata.`.trimStart();
    const result = toAST(input);
    expect(result.value).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "content": [
              {
                "content": "This is a paragraph with metadata.",
                "type": "PlainText",
              },
            ],
            "context": "paragraph",
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
              "title": {
                "content": "Block Title",
                "type": "PlainText",
              },
            },
            "type": "BlockParagraph",
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
    expect(result.value).toMatchInlineSnapshot(`
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
            "context": "paragraph",
            "type": "BlockParagraph",
          },
        ],
        "type": "Document",
      }
    `);
  });
  test("Parse header block", async ({ expect }) => {
    const input = `== Section Header`;
    const result = toAST(input);
    expect(result.value).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "content": [
              {
                "content": "Section Header",
                "type": "PlainText",
              },
            ],
            "context": "section",
            "level": 2,
            "type": "Header",
          },
        ],
        "type": "Document",
      }
    `);
  });
  test("ListingBlock promoted to SourceBlock", async ({ expect }) => {
    const input = `[source,javascript]
----
function hello() {${" "}
  console.log("Hello, world!");
}
----`;
    const result = toAST(input, "Block");
    expect(result.value).toMatchInlineSnapshot(`
      {
        "content": [
          {
            "content": "function hello()",
            "type": "PlainText",
          },
          {
            "content": "{ ",
            "type": "PlainText",
          },
          {
            "content": "console.log("Hello, world!");",
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
      }
    `);
  });
});
