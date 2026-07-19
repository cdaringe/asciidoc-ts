import { pipe } from "./fp.js";
import * as t from "./ast-types.js";
export const maybeBlockPromoteToCode = <B extends Partial<t.Block>>(
  block: B,
): B => {
  const metadata = block.metadata;
  if (!metadata) {
    return block;
  }
  if (
    block.type === "BlockListing" && metadata.attributes?.[0]?.name === "source"
  ) {
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
    deriveFloatingTitleContext,
    (it) => maybeBlockPromoteToCode(it),
    deriveWellKnownAttributes,
  )(block);
};

const deriveFloatingTitleContext = <B extends Partial<t.Block>>(
  block: B,
): B => {
  const style = block.metadata?.attributes?.[0]?.name;
  if (
    block.type === "Header" &&
    block.context === "section" &&
    (style === "discrete" || style === "float")
  ) {
    return { ...block, context: "floating_title" } as B;
  }
  return block;
};

const shorthandType = (
  name: string,
):
  | t.AttributeId["type"]
  | t.AttributeOption["type"]
  | t.AttributeRole["type"]
  | undefined => {
  if (name.startsWith("#")) return "AttributeId";
  if (name.startsWith(".")) return "AttributeRole";
  if (name.startsWith("%")) return "AttributeOption";
  return undefined;
};

const deriveWellKnownAttributes = <B extends Partial<t.Block>>(block: B): B => {
  const attributes = block.metadata?.attributes;
  if (!attributes) return block;
  let position = 0;
  const specialized = attributes.map((attribute): t.Attribute => {
    if (attribute.type !== "AttributePositional") return attribute;
    position += 1;
    const shorthand = shorthandType(attribute.name);
    if (shorthand) return { ...attribute, type: shorthand } as t.Attribute;
    if (position === 1) return { ...attribute, type: "AttributeStyle" };
    if (block.context === "quote" || block.context === "verse") {
      if (position === 2) return { ...attribute, type: "AttributeAuthor" };
      if (position === 3) return { ...attribute, type: "AttributeCitation" };
    }
    if (block.type === "BlockSource" && position === 2) {
      return { ...attribute, type: "AttributeLanguage" };
    }
    return attribute;
  });
  return {
    ...block,
    metadata: { ...block.metadata, attributes: specialized },
  } as B;
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
  if (block.delimiter === "--") {
    return {
      ...block,
      context: "open",
      type: "BlockOpen",
    } as B;
  }
  const delimiterChar = block.delimiter?.slice(
    0,
    1,
  ) as keyof typeof contextByMarker;
  const defaultContext = contextByMarker[delimiterChar];
  const defaultBlockType = blockTypeByMarker[delimiterChar];
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
    "comment",
    "example",
    "listing",
    "literal",
    "partintro",
    "pass",
    "quote",
    "sidebar",
    "verse",
  ],
  pass: ["stem", "latexmath", "asciimath"],
  quote: ["verse"],
};
const admonitionStyles = [
  "CAUTION",
  "IMPORTANT",
  "NOTE",
  "TIP",
  "WARNING",
] as const;
/**
 * This is a mapping of block types to their attributes, used
 * strictly for the purpose of masquerading.
 */
const blocksAttrsByContext = {
  abstract: { context: "abstract", type: "BlockAbstract" } as Partial<
    t.BlockAbstract
  >,
  admonition: { context: "admonition", type: "BlockAdmonition" } as Partial<
    t.BlockAdmonition
  >,
  listing: { context: "listing", type: "BlockListing" } as Partial<
    t.BlockListing
  >,
  literal: { context: "literal", type: "BlockLiteral" } as Partial<
    t.BlockLiteral
  >,
  open: { context: "open", type: "BlockOpen" } as Partial<t.BlockOpen>,
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
  if (
    admonitionStyles.includes(
      defaultStyle as typeof admonitionStyles[number],
    ) &&
    block.context && ["example", "open", "paragraph"].includes(block.context)
  ) {
    return {
      ...block,
      admonitionType: defaultStyle,
      context: "admonition",
      type: "BlockAdmonition",
    } as B;
  }
  const styleContext = defaultStyle === "source" ? "listing" : defaultStyle;
  const sourceContext = block.context === "paragraph" ? "open" : block.context;
  const allowed =
    masqueradingFromTo[sourceContext as keyof typeof masqueradingFromTo];
  if (!allowed) {
    return block;
  }
  const nextAttrs = blocksAttrsByContext[styleContext as t.BlockContext];
  if (allowed.includes(styleContext) && nextAttrs) {
    return {
      ...block,
      ...nextAttrs,
    } as B;
  }
  return block;
};
