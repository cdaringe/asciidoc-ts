import { describe, expect, test } from "vitest";
import { toAST } from "./mod.js";

test("Paragraph - simple", async ({ expect }) => {
  const input = `A simple paragraph.`;
  const result = toAST(input);
  expect(result).toMatchSnapshot();
});

test("Paragraph - with InlineElements", async ({ expect }) => {
  const input = `This is *foo* bar`;
  const result = toAST(input);
  expect(result).toMatchSnapshot();
});

test("Paragraph - with newlines", async ({ expect }) => {
  const input = `Still\none\nparagraph.`;
  const result = toAST(input);
  expect(result).toMatchSnapshot();
});

test("Paragraph - 2 newlines as 2 Paragraphs", async ({ expect }) => {
  const input = `Two\n\nparagraphs.`;
  const result = toAST(input);
  expect(result).toMatchSnapshot();
});
