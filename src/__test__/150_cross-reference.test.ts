import { test } from "vitest";
import { toAST } from "../mod.js";

test("Cross-references - internal", async ({ expect }) => {
  const input = `
[[section-1]]
== Section 1

reference_to_section_2 <<section-2>>

[[section-2]]
== Section 2

<<section-1,ref_to_section_1>>.

reference_to_section_2 <<_subsection_2_1>>

=== Subsection 2.1

`.trim();
  const result = toAST(input);
  expect(result.value).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "anchor": {
            "id": "section-1",
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
              "content": "reference_to_section_2 <<section-2>>",
              "type": "PlainText",
            },
          ],
          "context": "paragraph",
          "type": "BlockParagraph",
        },
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
              "text": ",ref_to_section_1",
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
          "content": [
            {
              "content": "reference_to_section_2 <<_subsection_2_1>>",
              "type": "PlainText",
            },
          ],
          "context": "paragraph",
          "type": "BlockParagraph",
        },
        {
          "content": [
            {
              "content": "Subsection 2.1",
              "type": "PlainText",
            },
          ],
          "context": "section",
          "level": 3,
          "type": "Header",
        },
      ],
      "type": "Document",
    }
  `);
});
test("Cross-references - with custom text", async ({ expect }) => {
  const input = `
= Document Title

[[introduction]]
== Introduction

For more details, see <<conclusion,the conclusion of this document>>.

[[conclusion]]
== Conclusion

As mentioned in <<introduction,the introduction>>, this is the end of the document.
`.trim();
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "content": [
            {
              "content": "Document Title",
              "type": "PlainText",
            },
          ],
          "level": 1,
          "type": "Header",
        },
        {
          "anchor": {
            "id": "introduction",
            "type": "BlockAnchor",
          },
          "content": [
            {
              "content": "Introduction",
              "type": "PlainText",
            },
          ],
          "level": 2,
          "type": "Header",
        },
        {
          "content": [
            {
              "content": "For more details, see ",
              "type": "PlainText",
            },
            {
              "id": "conclusion",
              "text": ",the conclusion of this document",
              "type": "CrossReference",
            },
            {
              "content": ".",
              "type": "PlainText",
            },
          ],
          "type": "Paragraph",
        },
        {
          "anchor": {
            "id": "conclusion",
            "type": "BlockAnchor",
          },
          "content": [
            {
              "content": "Conclusion",
              "type": "PlainText",
            },
          ],
          "level": 2,
          "type": "Header",
        },
        {
          "content": [
            {
              "content": "As mentioned in ",
              "type": "PlainText",
            },
            {
              "id": "introduction",
              "text": ",the introduction",
              "type": "CrossReference",
            },
            {
              "content": ", this is the end of the document.",
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
test("Cross-references - to non-section elements", async ({ expect }) => {
  const input = `
reference to <<table-1>>.

[[table-1]]
.BlockTable 1: Sample data
|===
| Header 1 |
| Data 1   |
|===
`.trim();
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "content": [
            {
              "content": "reference to ",
              "type": "PlainText",
            },
            {
              "id": "table-1",
              "text": null,
              "type": "CrossReference",
            },
            {
              "content": ".",
              "type": "PlainText",
            },
          ],
          "type": "Paragraph",
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
              "content": "| Data 1   |",
              "type": "PlainText",
            },
            {
              "content": "|===",
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
