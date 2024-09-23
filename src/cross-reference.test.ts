import { test } from 'vitest'
import { toAST } from './mod.js'

test('Cross-references - internal', async ({ expect }) => {
  const input = `
= Document Title

[[section-1]]
== Section 1

This is a reference to <<section-2>>.

[[section-2]]
== Section 2

This section refers back to <<section-1,the first section>>.

Here's a reference to <<_subsection_2_1>>.

=== Subsection 2.1

This is a subsection.
`.trim();
  const result = toAST(input)
  expect(result).toMatchSnapshot()
})

test('Cross-references - with custom text', async ({ expect }) => {
  const input = `
= Document Title

[[introduction]]
== Introduction

For more details, see <<conclusion,the conclusion of this document>>.

[[conclusion]]
== Conclusion

As mentioned in <<introduction,the introduction>>, this is the end of the document.
`.trim();

  const result = toAST(input)
  expect(result).toMatchSnapshot()
})

test('Cross-references - to non-section elements', async ({ expect }) => {
  const input = `
reference to <<table-1>>.

[[table-1]]
.Table 1: Sample data
|===
| Header 1 |
| Data 1   |
|===
`.trim();
  const result = toAST(input)
  expect(result).toMatchSnapshot()
})
