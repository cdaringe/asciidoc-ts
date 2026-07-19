import { describe, expect, test } from "vitest";
import type { SemanticValue } from "../ast-types.js";
import { print } from "../print.js";
import { toAST } from "./parser.js";

describe("print", () => {
  test.each([
    ["header", "== A heading", "Header"],
    ["inline formatting", "*bold* _italic_ `code`", "SingleLineText"],
    ["URL macro", "https://example.com[label]", "UrlMacro"],
    ["cross-reference", "<<target,label>>", "CrossReference"],
    ["admonition", "NOTE: Remember this.", "Block"],
  ])("prints parsed %s values", (_name, input, rule) => {
    const result = toAST(input, rule);
    expect(result.ok).toBe(true);
    if (result.ok) expect(print(result.value)).toBe(input);
  });

  test("prints strings, arrays, and transparent records", () => {
    expect(print(["a", { value: "b" }] as SemanticValue)).toBe("a b");
  });

  test("prints constructed documents canonically", () => {
    expect(print({
      blocks: [{
        content: [{ content: "Hello.", type: "PlainText" }],
        context: "paragraph",
        type: "BlockParagraph",
      }],
      type: "Document",
    })).toBe("Hello.\n");
  });
});
