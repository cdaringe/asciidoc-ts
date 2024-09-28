import { describe, test } from "vitest";
import { toAST } from "../mod.js";

describe("Listing Block", () => {
  test("BlockListing", async ({ expect }) => {
    const input = `
[foo, bar]
baz

`.trimStart();
    const result = toAST(input);
    expect(result.value).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "content": [
              {
                "content": "baz",
                "type": "PlainText",
              },
            ],
            "context": "paragraph",
            "metadata": {
              "attributes": [
                {
                  "name": "foo",
                  "type": "AttributeEntry",
                },
                {
                  "name": "bar",
                  "type": "AttributeEntry",
                },
              ],
              "title": [],
            },
            "type": "BlockParagraph",
          },
        ],
        "type": "Document",
      }
    `);
  });
  test("BlockListing - delimited", async ({ expect }) => {
    const input = `
[foo, bar]
----
newlines are


ok
----
`.trimStart();
    const result = toAST(input);
    expect(result.value).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "content": [
              {
                "content": "newlines are",
                "type": "PlainText",
              },
              {
                "content": "
      ",
                "type": "PlainText",
              },
              {
                "content": "
      ",
                "type": "PlainText",
              },
              {
                "content": "ok",
                "type": "PlainText",
              },
            ],
            "context": "foo",
            "delimiter": "----",
            "metadata": {
              "attributes": [
                {
                  "name": "foo",
                  "type": "AttributeEntry",
                },
                {
                  "name": "bar",
                  "type": "AttributeEntry",
                },
              ],
              "title": [],
            },
            "type": "BlockListing",
          },
        ],
        "type": "Document",
      }
    `);
  });
  test("BlockSource", async ({ expect }) => {
    const input = `
[source, js]
----
foo();

bar();
----
`.trimStart();
    const result = toAST(input);
    expect(result.value).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "content": [
              {
                "content": "foo();",
                "type": "PlainText",
              },
              {
                "content": "
      ",
                "type": "PlainText",
              },
              {
                "content": "bar();",
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
                  "name": "js",
                  "type": "AttributeEntry",
                },
              ],
              "title": [],
            },
            "type": "BlockSource",
          },
        ],
        "type": "Document",
      }
    `);
  });
});
