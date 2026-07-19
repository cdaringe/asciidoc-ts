import { test } from "vitest";
import { print } from "../print.js";
import { toAST } from "./parser.js";

test("parse and print a complex document without losing information", ({ expect }) => {
  const input = `= AsciiDoc Printer Torture Test

An opening paragraph has *bold*, _italic_, \`monospace\`, ~subscript~, ^superscript^, and +++passthrough+++ content.
It also has link:https://example.com[an explicit link], image:avatar.png[Avatar], footnote:7[An important detail], and <<architecture>>.

[[architecture]]
== Architecture

.A paragraph with rich metadata
[#overview,.lead]
This section links to https://example.com/docs[the docs] and mixes **very bold** with __very italic__ text.

* First unordered item
** Nested unordered item with *emphasis*
*** Deep item with https://example.com/deep[details]
** Back to the second level
* Final top-level item

. First ordered item
.. Nested ordered item
... A deliberately non-sequential marker depth
.. Back to level two
. Final ordered item

NOTE: A concise admonition with _emphasis_.

"A quoted paragraph can span one line."
-- Ada Lovelace, Notes

[source,javascript]
----
function greet(name) {
console.log(\`Hello, \${name}!\`);
}
----

[listing]
....
$ npm test
all tests passed
....

====
An example contains its own paragraph.

TIP: Compound blocks contain independently parsed blocks.

****
A nested sidebar makes the tree deeper.
****
====

[quote,Grace Hopper,The Education of a Computer]
____
The most dangerous phrase is: We have always done it this way.
____

////
Comments can contain *formatting*.
They can also contain multiple paragraphs.
////

'''

== Closing Notes

The final paragraph points back to <<architecture>> and ends with https://example.com[one last URL].
`;

  const result = toAST(input);

  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(print(result.value)).toBe(input);
  expect(result.value.type).toBe("Document");
  expect(result.value.blocks.slice(0, 3)).toEqual([
    expect.objectContaining({ context: "section", level: 1, type: "Header" }),
    expect.objectContaining({ context: "paragraph", type: "BlockParagraph" }),
    expect.objectContaining({
      anchor: expect.objectContaining({ id: "architecture" }),
      context: "section",
      level: 2,
    }),
  ]);
  expect(result.value.blocks.length).toBeGreaterThan(15);
  expect(result.value.blocks).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ context: "ulist", type: "BlockList" }),
      expect.objectContaining({ context: "olist", type: "BlockList" }),
      expect.objectContaining({ context: "source", type: "BlockSource" }),
      expect.objectContaining({ context: "example", type: "BlockExample" }),
      expect.objectContaining({ context: "quote", type: "BlockQuote" }),
      expect.objectContaining({ context: "comment", type: "BlockComment" }),
      expect.objectContaining({ context: "thematic_break", type: "HorizontalRule" }),
    ]),
  );
});
