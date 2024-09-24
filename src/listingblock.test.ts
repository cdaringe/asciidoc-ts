import { test } from "vitest";
import { toAST } from "./mod.js";

test("ListingBlock", async ({ expect }) => {
  const input = `
[foo, bar]
baz

`;
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "type": "BlankLine",
        },
        {
          "content": [
            {
              "content": "baz",
              "type": "PlainText",
            },
          ],
          "metadata": {
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
          },
          "type": "Paragraph",
        },
      ],
      "type": "Document",
    }
  `);
});

test("ListingBlock - delimited", async ({ expect }) => {
  const input = `
[foo, bar]
----
newlines are


ok
----
`;
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "type": "BlankLine",
        },
        {
          "content": "newlines are


    ok",
          "delimited": true,
          "metadata": {
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
          },
          "type": "ListingBlock",
        },
      ],
      "type": "Document",
    }
  `);
});

test("CodeBlock", async ({ expect }) => {
  const input = `
[source, js]
----
foo();

bar();
----
`.trimStart();
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "content": "foo();

    bar();",
          "delimited": true,
          "metadata": {
            "attributes": [
              {
                "name": "source",
                "type": "AttributeEntry",
              },
              {
                "name": "js",
                "type": "AttributeEntry",
              },
            ],
          },
          "type": "CodeBlock",
        },
      ],
      "type": "Document",
    }
  `);
});
