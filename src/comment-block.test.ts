import { describe, expect, test } from "vitest";
import { toAST } from "./mod.js";

test("Comment", async ({ expect }) => {
  const input = `////
totally cool comment.

can you EVEN **believe** it?

_I can!_
////
`;
  const result = toAST(input);
  expect(result).toMatchInlineSnapshot(`
    {
      "blocks": [
        {
          "content": "totally cool comment.

    can you EVEN **believe** it?

    _I can!_
    ",
          "type": "CommentBlock",
        },
      ],
      "type": "Document",
    }
  `);
});
