import { test } from "vitest";
import { toAST } from "./mod.js";

test("block quote ___ delimiting", async ({ expect }) => {
  const input =
    `"I hold it that a little rebellion now and then is a good thing,
and as necessary in the political world as storms in the physical."
-- Thomas Jefferson, Papers of Thomas Jefferson: Volume 11
`;
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "citation": "Thomas Jefferson, Papers of Thomas Jefferson: Volume 11",
          "content": "I hold it that a little rebellion now and then is a good thing,
    and as necessary in the political world as storms in the physical.",
          "type": "QuotedParagraphBlock",
        },
      ],
      "type": "Document",
    }
  `);
});
