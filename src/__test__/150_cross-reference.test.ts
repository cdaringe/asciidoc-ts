import { describe, test } from "vitest";
import { toAST } from "../mod.js";

describe("cross-reference", () => {
  test("basic ref", async ({ expect }) => {
    const input = `
[[test-anchor-1]]
== Section 1

reference_to_section_2 <<section-2>>
`.trim();
    const result = toAST(input);
    expect(result.value).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "anchor": {
              "id": "test-anchor-1",
              "type": "BlockAnchor",
            },
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
                "content": "reference_to_section_2",
                "type": "PlainText",
              },
              {
                "id": "section-2",
                "text": [],
                "type": "CrossReference",
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

  test("with custom text", async ({ expect }) => {
    const input = `
[[section-2]]
== Section 2

<<section-1,ref_to_section_1>>.

`.trimStart();
    const result = toAST(input);
    expect(result.value).toMatchInlineSnapshot(`
  {
    "blocks": [
      {
        "anchor": {
          "id": "section-2",
          "type": "BlockAnchor",
        },
        "content": [
          {
            "content": "Section 2",
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
            "id": "section-1",
            "text": [
              {
                "content": "ref_to_section_1",
                "type": "PlainText",
              },
            ],
            "type": "CrossReference",
          },
          {
            "content": ".",
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

  test("subsection", async ({ expect }) => {
    const input = `
reference_to_section_2 <<_subsection_2_1>>

`.trimStart();
    const result = toAST(input);
    expect(result.value).toMatchInlineSnapshot(`
  {
    "blocks": [
      {
        "content": [
          {
            "content": "reference_to_section_2",
            "type": "PlainText",
          },
          {
            "id": "_subsection_2_1",
            "text": [],
            "type": "CrossReference",
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

  test("to non-section elements", async ({ expect }) => {
    const input = `
reference to <<table-1>>.

[[table-1]]
.BlockTable 1: Sample data
|===
| Header 1 |
|===
`.trim();
    const result = toAST(input);
    expect(result.value).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "content": [
              {
                "content": "reference to",
                "type": "PlainText",
              },
              {
                "id": "table-1",
                "text": [],
                "type": "CrossReference",
              },
              {
                "content": ".",
                "type": "PlainText",
              },
            ],
            "context": "paragraph",
            "type": "BlockParagraph",
          },
          {
            "anchor": {
              "id": "table-1",
              "type": "BlockAnchor",
            },
            "content": [
              {
                "content": ".BlockTable 1: Sample data",
                "type": "PlainText",
              },
              {
                "content": "|===",
                "type": "PlainText",
              },
              {
                "content": "| Header 1 |",
                "type": "PlainText",
              },
              {
                "content": "|===",
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
});
