import { test } from "vitest";
import { toAST } from "./mod.js";

test("Cross-references - internal", async ({ expect }) => {
  const input = `
= Document Title

[[section-1]]
== Section 1

This is a reference to <<section-2>>.

[[section-2]]
== Section 2

This section refers back to <<section-1,the first section>>.

Here's a reference to <<_subsection_2_1>>.

=== Subsection 2.1

This is a subsection.
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
            "id": "section-1",
            "type": "BlockAnchor",
          },
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
              "content": "This is a reference to ",
              "type": "PlainText",
            },
            {
              "id": "section-2",
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
            "id": "section-2",
            "type": "BlockAnchor",
          },
          "content": [
            {
              "content": "Section 2",
              "type": "PlainText",
            },
          ],
          "level": 2,
          "type": "Header",
        },
        {
          "content": [
            {
              "content": "This section refers back to ",
              "type": "PlainText",
            },
            {
              "id": "section-1",
              "text": ",the first section",
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
          "content": [
            {
              "content": "Here's a reference to ",
              "type": "PlainText",
            },
            {
              "id": "_subsection_2_1",
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
          "content": [
            {
              "content": "Subsection 2.1",
              "type": "PlainText",
            },
          ],
          "level": 3,
          "type": "Header",
        },
        {
          "content": [
            {
              "content": "This is a subsection.",
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
.Table 1: Sample data
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
              "content": ".Table 1: Sample data",
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
