import { describe, test } from "vitest";
import { toAST } from "../mod.js";

describe("document", () => {
  test("base", async ({ expect }) => {
    expect(toAST(`:title:`, "DocumentAttribute")).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": {
          "name": "title",
          "type": "AttributeEntry",
          "value": [],
        },
      }
    `);
  });

  test("value", async ({ expect }) => {
    expect(toAST(`:title:with an inline value`, "DocumentAttribute"))
      .toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": {
          "name": "title",
          "type": "AttributeEntry",
          "value": [
            {
              "content": "with an inline value",
              "type": "PlainText",
            },
          ],
        },
      }
    `);

    expect(toAST(
      `:title:with a multiline \
value \
bro
  `,
      "DocumentAttribute",
    )).toMatchInlineSnapshot(`
    {
      "ok": true,
      "value": {
        "name": "title",
        "type": "AttributeEntry",
        "value": [
          {
            "content": "with a multiline value bro",
            "type": "PlainText",
          },
        ],
      },
    }
  `);
  });
});
