import { describe, test } from "vitest";
import { toAST } from "../mod.js";

describe("lexical rules", () => {
  test("anchor_id", async ({ expect }) => {
    expect(toAST(`foo `, "anchor_id")).toMatchInlineSnapshot(`
    {
      "ok": true,
      "value": {
        "content": "foo ",
        "type": "PlainText",
      },
    }
  `);
    expect(toAST(`  bar`, "anchor_id")).toMatchInlineSnapshot(`
    {
      "ok": true,
      "value": {
        "content": "  bar",
        "type": "PlainText",
      },
    }
  `);

    expect(toAST(`foo bar]`, "anchor_id").ok).toBeFalsy();
  });

  test("anchor_reftext", async ({ expect }) => {
    expect(toAST(`, reftext`, "anchor_reftext")).toMatchInlineSnapshot(
      `
    {
      "ok": true,
      "value": {
        "content": " reftext",
        "type": "PlainText",
      },
    }
  `,
    );

    expect(toAST(`, reftext]]`, "anchor_reftext").ok).toBe(false);
  });

  test("any_non_newline", async ({ expect }) => {
    expect(toAST(`f`, "any_non_newline")).toMatchInlineSnapshot(`
    {
      "ok": true,
      "value": "f",
    }
  `);
    expect(toAST(`o`, "any_non_newline")).toMatchInlineSnapshot(`
    {
      "ok": true,
      "value": "o",
    }
  `);
    expect(toAST(` `, "any_non_newline")).toMatchInlineSnapshot(`
    {
      "ok": true,
      "value": " ",
    }
  `);
    expect(toAST(`\n`, "any_non_newline").ok).toBeFalsy();
  });

  test("any_non_newline_text", async ({ expect }) => {
    expect(toAST(" beep _ - / {} bop \t", "any_non_newline_text<end>"))
      .toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": {
          "content": " beep _ - / {} bop 	",
          "type": "PlainText",
        },
      }
    `);

    expect(toAST(`\n`, "any_non_newline_text<end>").ok).toBeFalsy();
  });
});
