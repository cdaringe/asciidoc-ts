import { test } from "vitest";
import { toAST } from "../mod.js";

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
