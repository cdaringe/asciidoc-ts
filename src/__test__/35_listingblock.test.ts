import { describe, test } from "vitest";
import { toAST } from "./parser.js";

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
                  "type": "AttributeStyle",
                },
                {
                  "name": "bar",
                  "type": "AttributePositional",
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
            "context": "listing",
            "delimiter": "----",
            "metadata": {
              "attributes": [
                {
                  "name": "foo",
                  "type": "AttributeStyle",
                },
                {
                  "name": "bar",
                  "type": "AttributePositional",
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
                  "type": "AttributeStyle",
                },
                {
                  "name": "js",
                  "type": "AttributeLanguage",
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
  test("literal container masquerades as a listing", async ({ expect }) => {
    const result = toAST("[listing]\n....\na > b\n....");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.blocks[0]).toMatchObject({
      context: "listing",
      delimiter: "....",
      type: "BlockListing",
    });
  });
  test("unknown styles do not replace the container context", async ({ expect }) => {
    const result = toAST("[custom]\n----\ncontent\n----");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.blocks[0]).toMatchObject({
      context: "listing",
      type: "BlockListing",
    });
  });
  test("admonition style masquerades an example block", async ({ expect }) => {
    const result = toAST("[NOTE]\n====\nRemember the milk.\n====");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.blocks[0]).toMatchObject({
      admonitionType: "NOTE",
      context: "admonition",
      type: "BlockAdmonition",
    });
  });
});
