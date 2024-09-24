import { test } from "vitest";
import { toAST } from "./mod.js";
test("Parse URL Macro", async ({ expect }) => {
  const input = `https://example.com[foo, bar]`;
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "content": [
            {
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
              "scheme": "https",
              "type": "UrlMacro",
              "url": "https://example.com",
            },
          ],
          "type": "Paragraph",
        },
      ],
      "type": "Document",
    }
  `);
});
