import { describe, test } from "vitest";
import { toAST } from "../mod.js";

describe("quoted paragraph", () => {
  test("basic", async ({ expect }) => {
    const input =
      `"I hold it that a little rebellion now and then is a good thing,
and as necessary in the political world as storms in the physical."
-- Thomas Jefferson, Papers of Thomas Jefferson: Volume 11
`;
    const result = toAST(input);
    expect(result.value).toMatchInlineSnapshot(`
      {
        "blocks": [
          {
            "citation": "Thomas Jefferson, Papers of Thomas Jefferson: Volume 11",
            "content": [
              {
                "content": "I hold it that a little rebellion now and then is a good thing,",
                "type": "PlainText",
              },
              {
                "content": "and as necessary in the political world as storms in the physical.",
                "type": "PlainText",
              },
            ],
            "context": "quote",
            "type": "BlockQuotedParagraph",
          },
        ],
        "type": "Document",
      }
    `);
  });
});
