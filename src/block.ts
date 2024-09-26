import { pipe } from "./fp.js";
import * as t from "./ast-types.js";

export const maybeBlockPromoteToCode = <B extends Partial<t.Block>>(
  block: B,
): B => {
  const metadata = block.metadata;
  if (!metadata) {
    return block;
  }
  if (block.type === "BlockListing" && metadata.attributes?.[0]?.name === "source") {
    return {
      ...block,
      context: "source",
      type: "BlockSource",
    } as B;
  }
  return block;
};
export const toDerivedBlockType = <B extends Partial<t.Block>>(block: B): B => {
  const defaultStyle = block.metadata?.attributes?.[0]?.name;
  return pipe(
    deriveBlockDefaultContext,
    (it) => deriveBlockMasquerading(it, defaultStyle),
    it => maybeBlockPromoteToCode(it),
  )(block);
};
const contextByMarker: Record<string, t.BlockContext> = {
  "_": "quote",
  "-": "listing",
  ".": "literal",
  "*": "sidebar",
  "/": "comment",
  "+": "pass",
  "=": "example",
} as const;
const blockTypeByMarker: Record<string, t.Block["type"]> = {
  "_": "BlockQuote",
  "-": "BlockListing",
  ".": "BlockLiteral",
  "*": "BlockSidebar",
  "/": "BlockComment",
  "+": "BlockPassthrough",
  "=": "BlockExample",
} as const;
const deriveBlockDefaultContext = <B extends Partial<t.Block>>(block: B): B => {
  const delimiterChar = block.delimiter?.slice(
    0,
    1,
  ) as keyof typeof contextByMarker;
  const defaultContext = contextByMarker[delimiterChar];
  const defaultBlockType = blockTypeByMarker[delimiterChar];
  const blockStyle = block.metadata?.attributes?.[0]?.name;
  if (!defaultContext || !defaultBlockType) {
    if (!block.context) {
      throw new Error(`impossible case: missing context for block}`);
    }
    return block;
  }
  const blk = block as {
    context: t.BlockContext;
    type: t.Block["type"];
  };
  const isMissingContext = !blk.context;
  if (isMissingContext) {
    blk.context = defaultContext;
    blk.type = defaultBlockType;
  }
  const isUsingBlockStyleMasquerade = blockStyle &&
    blockStyle !== blk.context && blockStyle !== defaultContext;
  if (isUsingBlockStyleMasquerade) {
    blk.context = blockStyle as t.BlockContext;
  }
  return block;
};
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/blocks/masquerading/#built-in-permutations
 */
const masqueradingFromTo = {
  example: ["admonition"],
  listing: ["literal"],
  literal: ["listing"],
  open: [
    "abstract",
    "admonition",
    "partintro",
    "pass",
    "quote",
    "sidebar",
    "verse",
  ],
  pass: ["stem", "latexmath", "asciimath"],
  quote: ["verse"],
};
/**
 * This is a mapping of block types to their attributes, used
 * strictly for the purpose of masquerading.
 */
const blocksAttrsByContext = {
  abstract: { context: "abstract", type: "BlockAbstract" } as Partial<
    t.BlockAbstract
  >,
  admonition: { context: "admonition", type: "Admonition" } as Partial<
    t.BlockAdmonition
  >,
  listing: { context: "listing", type: "BlockListing" } as Partial<
    t.BlockListing
  >,
  literal: { context: "literal", type: "BlockLiteral" } as Partial<
    t.BlockLiteral
  >,
  partintro: { context: "partintro", type: "BlockPartintro" } as Partial<
    t.BlockPartintro
  >,
  pass: { context: "pass", type: "BlockPassthrough" } as Partial<
    t.BlockPassthrough
  >,
  quote: { context: "quote", type: "BlockQuote" } as Partial<t.BlockQuote>,
  sidebar: { context: "sidebar", type: "BlockSidebar" } as Partial<
    t.BlockSidebar
  >,
  verse: { context: "verse", type: "BlockVerse" } as Partial<t.BlockVerse>,
} as Record<t.BlockContext, Partial<t.BlockBase<any, any>>>;
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/blocks/masquerading/#built-in-permutations
 */
const deriveBlockMasquerading = <B extends Partial<t.BlockStructure>>(
  block: B,
  defaultStyle?: string,
): B => {
  if (!defaultStyle) {
    return block;
  }
  const allowed =
    masqueradingFromTo[block.context as keyof typeof masqueradingFromTo];
  if (!allowed) {
    return block;
  }
  const nextAttrs = blocksAttrsByContext[defaultStyle as t.BlockContext];
  if (allowed.includes(defaultStyle) && nextAttrs) {
    return {
      ...block,
      ...nextAttrs,
    } as B;
  }
  return block;
};
