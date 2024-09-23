import { describe, expect, test } from "vitest";
import { toAST } from "./mod.js";

test("Sequential InlineElements", async ({ expect }) => {
  const input =
    `This paragraph has *bold*, _italic_, and ${"`"}monospace${"`"} text.`;
  const result = toAST(input);
  expect(result).toMatchSnapshot();
});
