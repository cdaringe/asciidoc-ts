import { test } from "vitest";
import { toAST } from "./mod.js";

test("Parse Header (without \\n is PlainText)", async ({ expect }) => {
  const input = `= Main Header`;
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "content": [
            {
              "content": "Main Header",
              "type": "PlainText",
            },
          ],
          "level": 1,
          "type": "Header",
        },
      ],
      "type": "Document",
    }
  `);
});

test("Parse Header (with \\n)", async ({ expect }) => {
  const input = `== Main Header\n `;
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "content": [
            {
              "content": "Main Header",
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
