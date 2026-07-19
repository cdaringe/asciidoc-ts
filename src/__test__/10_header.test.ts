import { expect, test } from "vitest";
import { toAST } from "./parser.js";

test("Parse Header (without \\n is PlainText)", async ({ expect }) => {
  const input = `= Main Header`;
  const result = toAST(input, "Header");
  expect(result.value).toMatchInlineSnapshot(`
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
    }
  `);
});
test("Parse Header (with \\n)", async ({ expect }) => {
  const input = `== Main Header\n `;
  const result = toAST(input, "Header");
  expect(result.value).toMatchInlineSnapshot(`
    {
      "content": [
        {
          "content": "Main Header",
          "type": "PlainText",
        },
      ],
      "context": "section",
      "level": 2,
      "type": "Header",
    }
  `);
});

test.each([["discrete"], ["float"]])(
  "Parse Header with %s style as a floating title",
  async (style) => {
    const result = toAST(`[${style}]\n== Standalone Heading`);

    expect(result.ok).toBe(true);
    expect(result.value).toEqual({
      blocks: [
        {
          content: [{ content: "Standalone Heading", type: "PlainText" }],
          context: "floating_title",
          level: 2,
          metadata: {
            attributes: [{ name: style, type: "AttributeStyle" }],
            title: [],
          },
          type: "Header",
        },
      ],
      type: "Document",
    });
  },
);
