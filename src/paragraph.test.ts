import { test } from "vitest";
import { toAST } from "./mod.js";
test("Paragraph - simple", async ({ expect }) => {
  const input = `A simple paragraph.`;
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "content": [
            {
              "content": "A simple paragraph.",
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
test("Paragraph - with InlineElements", async ({ expect }) => {
  const input = `This is *foo* bar`;
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "content": [
            {
              "content": "This is ",
              "type": "PlainText",
            },
            {
              "content": [
                {
                  "content": "foo",
                  "type": "PlainText",
                },
              ],
              "type": "ConstrainedBold",
            },
            {
              "content": "bar",
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
test("Paragraph - with newlines", async ({ expect }) => {
  const input = `Still\none\nparagraph.`;
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "content": [
            {
              "content": "Still",
              "type": "PlainText",
            },
            {
              "content": "one",
              "type": "PlainText",
            },
            {
              "content": "paragraph.",
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
test("Paragraph - 2 newlines as 2 Paragraphs", async ({ expect }) => {
  const input = `Two\n\nparagraphs.`;
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "content": [
            {
              "content": "Two",
              "type": "PlainText",
            },
          ],
          "type": "Paragraph",
        },
        {
          "content": [
            {
              "content": "paragraphs.",
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
