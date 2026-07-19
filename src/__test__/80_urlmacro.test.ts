import { test } from "vitest";
import { toAST } from "./parser.js";
test("Parse URL Macro", async ({ expect }) => {
  const input = `https://example.com[foo, bar]`;
  const result = toAST(input, "UrlMacro");
  expect(result.value).toMatchInlineSnapshot(`
    {
      "attributes": [
        {
          "name": "foo",
          "type": "AttributePositional",
        },
        {
          "name": "bar",
          "type": "AttributePositional",
        },
      ],
      "scheme": "https",
      "type": "UrlMacro",
      "url": "https://example.com",
    }
  `);
});
