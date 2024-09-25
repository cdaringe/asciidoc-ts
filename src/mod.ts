import { grammar as ohmGrammar } from "ohm-js";
import { getEnvVar } from "./env.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const grammarFilename = path.resolve(__dirname, "grammar.ohm");
export const grammarString = fs.readFileSync(grammarFilename, "utf8");
export const grammar = ohmGrammar(grammarString);
// Define types for AST nodes
type ASTNode = Document | Block | InlineElement;
interface Document {
  blocks: Block[];
  type: "Document";
}
interface BlockAnchor {
  id: string;
  reftext?: string;
  type: "BlockAnchor";
}
/**
 * https://docs.asciidoctor.org/asciidoc/latest/blocks/#summary-of-built-in-contexts
 */
type BlockContext =
  | "admonition"
  | "audio"
  | "colist"
  | "dlist"
  | "document"
  | "example"
  | "floating_title"
  | "image"
  | "list_item"
  | "listing"
  | "literal"
  | "olist"
  | "open"
  | "page_break"
  | "paragraph"
  | "pass"
  | "preamble"
  | "quote"
  | "section"
  | "sidebar"
  | "table"
  | "table_cell"
  | "thematic_break"
  | "toc"
  | "ulist"
  | "verse"
  | "video"
  // semi-std
  // not listed by asciidoc as std, but referred to as std
  | "abstract"
  | "partintro"
  // non-std
  | "blank_line"
  | "comment"
  | "macro"
  | "unknown";
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/blocks/#content-model
 */
type BlockModel =
  | "compound"
  | "simple"
  | "verbatim"
  | "raw"
  | "empty"
  | "table"
  | "unknown";
interface BlockBase<C extends BlockContext, M extends BlockModel> {
  anchor?: BlockAnchor;
  metadata?: BlockMetaData;
  delimiter?: string;
  context: C;
  content: M extends "compound" ? Block[]
    : M extends "simple" ? ((InlineElement | PlainText)[])
    : M extends "verbatim" ? string
    : M extends "raw" ? string
    : M extends "empty" ? undefined
    : M extends "table" ? TableRow[]
    : M extends "unknown" ? unknown
    : never;
}
/**
 * https://docs.asciidoctor.org/asciidoc/latest/blocks/
 */
interface BlockMetaData {
  attributes?: AttributeEntry[];
  id?: string;
  options?: string[];
  roles?: string[];
  title?: string;
}
type Block =
  | BlockSectionSetext
  | BlockSection
  | BlockParagraph
  | BlockList
  | BlockOrderedList
  | BlockDescriptionList
  | BlockListing
  | BlockTable
  | BlockHorizontalRule
  | BlockExample
  | BlockAdmonition
  | BlockMacro
  | BlankLine
  | BlockPassthrough
  | BlockQuote
  | BlockSidebar
  | BlockComment
  | BlockLiteral;
type BlockStructure = Block extends {
  content: any;
} ? Block
  : never;
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/sections/titles-and-levels/
 * @warn Counter to the documentation, we model the section as simple vs compound, and the header is itself the content.
 */
interface BlockSectionSetext extends BlockBase<"section", "empty"> {
  level: 1 | 2;
  type: "HeaderSetext";
}
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/sections/titles-and-levels/
 * @warn Counter to the documentation, we model the section as simple vs compound, and the header is itself the content.
 */
interface BlockSection extends BlockBase<"section", "empty"> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  type: "Header";
}
interface BlockParagraph extends BlockBase<"paragraph", "simple"> {
  type: "Paragraph";
}
interface BlockAbstract extends BlockBase<"abstract", "simple"> {
  type: "BlockAbstract";
}
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/sections/parts/#part-intro
 */
interface BlockPartintro extends BlockBase<"partintro", "simple"> {
  type: "BlockPartintro";
}
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/pass/pass-block/
 */
interface BlockPassthrough extends BlockBase<"pass", "verbatim"> {
  type: "BlockPassthrough";
}
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/verbatim/literal-blocks/
 */
interface BlockLiteral extends BlockBase<"literal", "verbatim"> {
  type: "BlockLiteral";
}
interface ParagraphSegment {
  content: InlineElement[];
  type: "ParagraphSegment";
}
interface BlockList
  extends Omit<BlockBase<"dlist" | "olist" | "ulist", "simple">, "content"> {
  content: ListItem[];
  type: "BlockList";
  ordered: boolean;
}
interface ListItem {
  content: InlineElement[];
  depth: number;
  type: "ListItem";
}
interface BlockOrderedList
  extends Omit<BlockBase<"olist", "simple">, "content"> {
  attributes?: AttributeEntry[];
  content: OrderedListItem[];
  type: "OrderedList";
}
interface OrderedListItem {
  content: InlineElement[];
  depth: number;
  type: "OrderedListItem";
}
interface BlockDescriptionList
  extends Omit<BlockBase<"dlist", "simple">, "content"> {
  content: DescriptionListItem[];
  type: "DescriptionList";
}
interface DescriptionListItem {
  description: InlineElement[];
  term: string;
  type: "DescriptionListItem";
}
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/verbatim/listing-blocks/
 */
interface BlockListing extends BlockBase<"listing", "verbatim"> {
  delimited?: boolean;
  type: "BlockListing";
}
interface BlockSource extends BlockBase<"listing", "verbatim"> {
  type: "BlockSource";
}
interface BlockQuote extends BlockBase<"quote", "simple"> {
  type: "BlockQuote";
}
interface BlockTable extends BlockBase<"table", "table"> {
  type: "BlockTable";
}
interface TableRow {
  content: TableCell[];
  type: "TableRow";
}
interface TableCell {
  content: InlineElement[];
  type: "TableCell";
}
interface BlockHorizontalRule extends BlockBase<"thematic_break", "empty"> {
  type: "HorizontalRule";
}
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/blocks/admonitions/
 */
interface BlockAdmonition extends BlockBase<"admonition", "simple"> {
  admonitionType: "NOTE" | "TIP" | "IMPORTANT" | "WARNING" | "CAUTION";
  type: "Admonition";
}
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/blocks/sidebars/
 */
interface BlockSidebar extends BlockBase<"sidebar", "simple"> {
  type: "BlockSidebar";
}
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/blocks/verses/
 */
interface BlockVerse extends BlockBase<"verse", "simple"> {
  type: "BlockVerse";
}
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/verbatim/literal-blocks/
 */
interface BlockLiteral extends BlockBase<"literal", "verbatim"> {
  type: "BlockLiteral";
}
interface BlockMacro extends BlockBase<"macro", "verbatim"> {
  attributes?: string;
  name: string;
  target?: string;
  type: "BlockMacro";
}
interface AttributeEntry<Name extends string = string> {
  name: Name;
  type: "AttributeEntry";
  value?: string;
}
interface BlockComment extends BlockBase<"comment", "verbatim"> {
  type: "BlockComment";
}
interface SingleLineText {
  content: InlineElement[];
  type: "SingleLineText";
}
interface BlankLine extends BlockBase<"blank_line", "empty"> {
  type: "BlankLine";
}
interface BlockExample extends BlockBase<"example", "simple"> {
  type: "BlockExample";
}
type InlineElement =
  | AttributeReference
  | ConstrainedBold
  | ConstrainedItalic
  | CrossReference
  | Footnote
  | InlineImage
  | InlinePassthrough
  | Link
  | MonospaceText
  | PlainText
  | SubscriptText
  | SuperscriptText
  | UnconstrainedBold
  | UnconstrainedItalic;
interface PlainText {
  content: string;
  type: "PlainText";
}
interface ConstrainedBold {
  content: InlineElement[];
  type: "ConstrainedBold";
}
interface UnconstrainedBold {
  content: InlineElement[];
  type: "UnconstrainedBold";
}
interface UnconstrainedItalic {
  content: InlineElement[];
  type: "UnconstrainedItalic";
}
interface ConstrainedItalic {
  content: InlineElement[];
  type: "ConstrainedItalic";
}
interface MonospaceText {
  content: InlineElement[];
  type: "MonospaceText";
}
interface Link {
  text: string;
  type: "Link";
  url: string;
}
interface ImageCommon {
  alt: string;
  height?: number;
  url: string;
  width?: number;
}
interface InlineImage extends ImageCommon {
  type: "InlineImage";
}
interface BlockImage extends ImageCommon {
  type: "BlockImage";
}
interface Footnote {
  id: string | null;
  text: InlineElement[];
  type: "Footnote";
}
interface CrossReference {
  id: string;
  text: string | null;
  type: "CrossReference";
}
interface InlinePassthrough {
  content: string;
  type: "InlinePassthrough";
}
interface SubscriptText {
  content: InlineElement[];
  type: "SubscriptText";
}
interface SuperscriptText {
  content: InlineElement[];
  type: "SuperscriptText";
}
interface AttributeReference {
  name: string;
  type: "AttributeReference";
}
interface BlockQuotedParagraph extends BlockBase<"quote", "simple"> {
  citation: string;
  type: "BlockQuotedParagraph";
}
interface UrlMacro {
  attributes?: (string | Record<string, string>)[];
  scheme: string;
  type: "UrlMacro";
  url: string;
}
export const toAST = (input: string): Document => {
  const semantics = grammar.createSemantics();
  semantics.addOperation("toAST", {
    _iter(...children) {
      const next = children.map((child) => child.toAST());
      if (
        typeof next[0] === "string" &&
        next.every((it) => typeof it === "string")
      ) {
        return next.join("");
      }
      return next;
    },
    _terminal() {
      return this.sourceString;
    },
    anchor_reftext(_comma, text) {
      return text.sourceString;
    },
    any_non_newline(content) {
      return content.sourceString;
    },
    AttributeEntry(_, name, __, value, _newline) {
      return {
        ...truthyValuesOrEmptyPojo({ value: value.sourceString.trim() }),
        name: name.sourceString,
        type: "AttributeEntry",
      } satisfies AttributeEntry;
    },
    AttributeList(_open, attrs, _close) {
      return attrs.toAST();
    },
    AttributeNamed(key, _eq, value) {
      return {
        name: key.toAST(),
        type: "AttributeEntry",
        value: value ? value.sourceString : undefined,
      } satisfies AttributeEntry;
    },
    AttributePositional(content) {
      return {
        name: content.sourceString,
        type: "AttributeEntry",
      } satisfies AttributeEntry;
    },
    AttributeReference(_, name, __) {
      return {
        name: name.sourceString,
        type: "AttributeReference",
      } satisfies AttributeReference;
    },
    BlankLine(_spaces, _newline) {
      return {
        content: undefined,
        context: "blank_line",
        type: "BlankLine",
      } satisfies BlankLine;
    },
    Block(blockStructureNode) {
      const blockStructureAst = blockStructureNode.toAST() as BlockStructure;
      const nextBlock = rewireBlock(blockStructureAst);
      return nextBlock;
    },
    block_title(_, bt, __) {
      return bt.toAST();
    },
    BlockAdmonition(type, content) {
      return {
        admonitionType: type.sourceString.slice(0, -1) as
          | "NOTE"
          | "TIP"
          | "IMPORTANT"
          | "WARNING"
          | "CAUTION",
        content: content.toAST(),
        context: "admonition",
        type: "Admonition",
      } satisfies BlockAdmonition;
    },
    BlockAnchor(_open, id, reftextNode, _close, _nl) {
      // "[[" anchorId anchor_reftext?  "]]" newline
      const reftext = reftextNode.toAST();
      return {
        ...(reftext.length ? { reftext } : undefined),
        id: id.sourceString,
        type: "BlockAnchor",
      } satisfies BlockAnchor;
    },
    BlockContentGeneric(_nl, content1, contentN) {
      return [content1.toAST(), ...(contentN.toAST() || [])];
    },
    BlockHorizontalRule(rule, _newline) {
      return {
        content: rule.toAST(),
        context: "thematic_break",
        type: "HorizontalRule",
      } satisfies BlockHorizontalRule;
    },
    BlockImage(_img, url, _open, alt, _comma, dims, _close) {
      const ast = this.inlineImage(_img, url, _open, alt, _comma, dims, _close)
        .toAST();
      return {
        ...ast,
        type: "BlockImage",
      } satisfies BlockImage;
    },
    // BlockListingDelimited(_d1, _nl1, content, _d2, _newline2) {
    //   return {
    //     content: content.sourceString.trim(),
    //     context: "listing",
    //     delimited: true,
    //     type: "BlockListing",
    //   } satisfies BlockListing;
    // },
    BlockMacro(name, _, target, attrs, _newline, content, _close, _newline2) {
      return {
        ...truthyValuesOrEmptyPojo({ target: target.sourceString }),
        ...truthyValuesOrEmptyPojo({ attributes: attrs.sourceString }),
        content: content.sourceString,
        context: "macro",
        name: name.sourceString,
        type: "BlockMacro",
      } satisfies BlockMacro;
    },
    BlockMetaData(titleNode, attributes, _newline) {
      const title = titleNode.toAST();
      return {
        ...(title.length ? { title } : undefined),
        attributes: attributes.toAST(),
      } satisfies BlockMetaData;
    },
    BlockParagraph(content) {
      const flattenParagraphSegments = (
        it: InlineElement | PlainText | ParagraphSegment,
      ): (InlineElement | PlainText)[] => {
        if (it.type === "ParagraphSegment") {
          return it.content.flatMap(flattenParagraphSegments);
        }
        return [it];
      };
      return {
        content: flattenParagraphSegments(content.toAST() as ParagraphSegment),
        context: "paragraph",
        type: "Paragraph",
      } satisfies BlockParagraph;
    },
    // BlockPassthrough(_open, _newline, content, _close, _newline2) {
    //   return {
    //     content: content.sourceString,
    //     context: "passthrough",
    //     type: "BlockPassthrough",
    //   } satisfies BlockPassthrough;
    // },
    // BlockQuote(_open, _newline, content, _close, _newline2) {
    //   return {
    //     content: content.toAST(),
    //     context: "quote",
    //     type: "BlockQuote",
    //   } satisfies BlockQuote;
    // },
    BlockQuotedParagraph(
      _open,
      content,
      _closed,
      _newline,
      _attribution,
      citation,
      _newline2,
    ) {
      // BlockQuotedParagraph = '"' (~'"' any)* '"' newline "--" plaintext? newline
      return {
        citation: citation.sourceString,
        content: content.toAST(),
        context: "quote",
        type: "BlockQuotedParagraph",
      } satisfies BlockQuotedParagraph;
    },
    BlockSectionSetext(text, underline, _) {
      return {
        content: text.toAST(),
        context: "section",
        level: underline.sourceString[0] === "=" ? 1 : 2,
        type: "HeaderSetext",
      } satisfies BlockSectionSetext;
    },
    // BlockSidebar(_open, _newline, content, _close, _newline2) {
    //   return {
    //     content: content.toAST(),
    //     context: "sidebar",
    //     type: "Sidebar",
    //   } satisfies BlockSidebar;
    // },
    BlockStructure(anchor, metadata, blockKind, _nl1, _nl2) {
      // BlockStructure<t> = BlockAnchor? BlockMetaData? t newline? newline?
      const [metadataAst] = metadata.toAST() ?? [];
      const [anchorAst] = anchor.toAST() ?? [];
      const nextBlock: BlockStructure = {
        ...blockKind.toAST(),
        ...truthyValuesOrEmptyPojo({ metadata: metadataAst }),
        ...truthyValuesOrEmptyPojo({ anchor: anchorAst }),
      } satisfies BlockStructure;
      if (
        nextBlock.type === "Paragraph" &&
        nextBlock.metadata?.attributes?.find((it) => it.name === "listing")
      ) {
        (nextBlock as Block).type = "BlockListing";
      }
      if (nextBlock.type === "BlockListing") {
        return maybeBlockPromoteToCode(nextBlock);
      }
      return nextBlock;
    },
    BlockTable(rows) {
      return {
        content: rows.toAST(),
        context: "table",
        type: "BlockTable",
      } satisfies BlockTable;
    },
    ConstrainedBold(_, content, __) {
      return {
        content: content.toAST(),
        type: "ConstrainedBold",
      } satisfies ConstrainedBold;
    },
    ConstrainedItalic(_, content, __) {
      return {
        content: content.toAST(),
        type: "ConstrainedItalic",
      } satisfies ConstrainedItalic;
    },
    CrossReference(_, id, text, __) {
      return {
        id: id.sourceString,
        text: text.sourceString || null,
        type: "CrossReference",
      } satisfies CrossReference;
    },
    DescriptionList(items) {
      return {
        content: items.toAST(),
        context: "dlist",
        type: "DescriptionList",
      } satisfies BlockDescriptionList;
    },
    DescriptionListItem(term, _, content) {
      return {
        description: content.toAST(),
        term: term.sourceString.trim(),
        type: "DescriptionListItem",
      } satisfies DescriptionListItem;
    },
    Document(blocks, _) {
      const astBlocks = (blocks.toAST() as Block[]).filter((it) => {
        if (typeof it === "string") {
          if ((it as string).trim() === "") {
            return false;
          }
          throw new Error(`Unexpected string in Block (${it}}`);
        }
        return true;
      });
      return {
        blocks: astBlocks,
        type: "Document",
      } satisfies Document;
    },
    FenceGeneric(delim1, _nl1, content, _nl2, _delim2) {
      return {
        content: content.toAST(),
        delimiter: delim1.sourceString,
      };
    },
    Footnote(_, id, __, text, ___) {
      return {
        id: id.sourceString || null,
        text: text.toAST(),
        type: "Footnote",
      } satisfies Footnote;
    },
    Header(marker, content, _maybeNewline) {
      return {
        content: content.toAST(),
        context: "section",
        level: marker.sourceString.length as 1 | 2 | 3 | 4 | 5 | 6,
        type: "Header",
      } satisfies BlockSection;
    },
    ImageDims(width, _comma, height) {
      const widthNum = width.sourceString
        ? parseInt(width.sourceString)
        : undefined;
      const heightNum = height.sourceString
        ? parseInt(height.sourceString)
        : undefined;
      return {
        ...(widthNum ? { width: widthNum } : undefined),
        ...(heightNum ? { height: heightNum } : undefined),
      };
    },
    InlineElement(element) {
      return element.toAST();
    },
    // ImageUrl = (~"[" any)+
    // ImageH = "," Digits
    // ImageW = Digits
    // ImageDims = ImageW ImageH?
    // InlineImage = "image:" ImageUrl "[" ImageAlt ("," ImageDims)? "]"
    // BlockImage = "image::" ImageUrl "[" ImageAlt ("," ImageDims)? "]"
    InlineImage(_img, url, _open, alt, _comma, dims, _close) {
      return {
        ...dims.toAST(),
        alt: alt.sourceString,
        type: "InlineImage",
        url: url.sourceString,
      } satisfies InlineImage;
    },
    InlinePassthrough(_, content, __) {
      return {
        content: content.sourceString,
        type: "InlinePassthrough",
      } satisfies InlinePassthrough;
    },
    line(content, _nl) {
      return content.toAST();
    },
    Link(_, url, __, text, ___) {
      return {
        text: text.sourceString,
        type: "Link",
        url: url.sourceString,
      } satisfies Link;
    },
    ListContinuation(_, _newline, content) {
      return content.toAST();
    },
    ListItemContent(content, continuation, _dunno) {
      return [...content.toAST(), ...(continuation.toAST() || [])];
    },
    MonospaceText(_, content, __) {
      return {
        content: content.toAST(),
        type: "MonospaceText",
      } satisfies MonospaceText;
    },
    nonemptyListOf(x, _sep, xs) {
      return [x.toAST()].concat(xs.toAST());
    },
    OrderedList(items) {
      return {
        content: normalizeDepth(items.toAST() as OrderedListItem[]),
        context: "olist",
        type: "OrderedList",
      } satisfies BlockOrderedList;
    },
    OrderedListItem(marker, content, _nl) {
      return {
        content: content.toAST(),
        depth: marker.sourceString.length,
        type: "OrderedListItem",
      } satisfies OrderedListItem;
    },
    ParagraphSegment(content, _bl, continuation) {
      // ParagraphSegment = InlineElementOrPlainText+ (BlankLine ParagraphSegment)?
      const children = [...content.toAST(), ...(continuation.toAST() || [])];
      return {
        content: children,
        type: "ParagraphSegment",
      } satisfies ParagraphSegment;
    },
    // plaintext(content) {
    //   return {
    //     content: content.sourceString,
    //     type: "PlainText",
    //   } satisfies PlainText;
    // },
    SingleLineText(content, _newline) {
      return {
        content: content.toAST(),
        type: "SingleLineText",
      } satisfies SingleLineText;
    },
    SubscriptText(_, content, __) {
      return {
        content: content.toAST(),
        type: "SubscriptText",
      } satisfies SubscriptText;
    },
    SuperscriptText(_, content, __) {
      return {
        content: content.toAST(),
        type: "SuperscriptText",
      } satisfies SuperscriptText;
    },
    TableCell(content) {
      return {
        content: content.toAST(),
        type: "TableCell",
      } satisfies TableCell;
    },
    TableRow(_marker, cells, _markers, _newline, _hmmwrong) {
      return {
        content: cells.toAST(),
        type: "TableRow",
      } satisfies TableRow;
    },
    UnconstrainedBold(_, content, __) {
      return {
        content: content.toAST(),
        type: "UnconstrainedBold",
      } satisfies UnconstrainedBold;
    },
    UnconstrainedItalic(_, content, __) {
      return {
        content: content.toAST(),
        type: "UnconstrainedItalic",
      } satisfies UnconstrainedItalic;
    },
    UnorderedList(items) {
      return {
        content: normalizeDepth(items.toAST() as ListItem[]),
        context: "ulist",
        ordered: true,
        type: "BlockList",
      } satisfies BlockList;
    },
    UnorderedListItem(marker, content, _nl) {
      return {
        content: content.toAST(),
        depth: marker.sourceString.length,
        type: "ListItem",
      } satisfies ListItem;
    },
    UrlMacro(scheme, _colon, url, attributes) {
      return {
        attributes: attributes.toAST(),
        scheme: scheme.sourceString,
        type: "UrlMacro",
        url: `${scheme.sourceString}:${url.sourceString}`,
      } satisfies UrlMacro;
    },
  });
  const matchResult = grammar.match(input);
  if (matchResult.succeeded()) {
    return semantics(matchResult).toAST();
  } else {
    throw new Error(`Parsing failed ${matchResult.message}`);
  }
};
const maybeBlockPromoteToCode = (
  listingBlock: BlockListing,
): BlockListing | BlockSource => {
  const metadata = listingBlock.metadata;
  if (!metadata) {
    return listingBlock;
  }
  if (metadata.attributes?.[0]?.name === "source") {
    return {
      ...listingBlock,
      type: "BlockSource",
    } as BlockSource;
  }
  return listingBlock;
};
const normalizeDepth = <
  T extends {
    depth: number;
  },
>(items: T[]): T[] => {
  const commonDepth = Math.min(...items.map((it) => it.depth));
  if (commonDepth > 1) {
    items.forEach((it) => it.depth -= commonDepth);
  }
  return items;
};
const truthyValuesOrEmptyPojo = <T extends Record<string, any>>(
  it: T,
): T | {} => {
  for (const key in it) {
    if (it[key] == null) {
      return {};
    }
  }
  return it;
};
const rewireBlock = <B extends Partial<Block>>(block: B): B => {
  const attrContext = block.metadata?.attributes?.[0]?.name;
  const nextBlock = rewireForDefaultContext(block);
  const finalBlock = attrContext
    ? rewireBlockForMasquerading(nextBlock, attrContext)
    : block;
  return finalBlock;
};
const contextByMarker: Record<string, BlockContext> = {
  "_": "quote",
  "-": "listing",
  ".": "literal",
  "*": "sidebar",
  "/": "comment",
  "+": "pass",
  "=": "example",
} as const;
const blockTypeByMarker: Record<string, Block["type"]> = {
  "_": "BlockQuote",
  "-": "BlockListing",
  ".": "BlockLiteral",
  "*": "BlockSidebar",
  "/": "BlockComment",
  "+": "BlockPassthrough",
  "=": "BlockExample",
} as const;
const rewireForDefaultContext = <B extends Partial<Block>>(block: B): B => {
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
    context: BlockContext;
    type: Block["type"];
  };
  const isMissingContext = !blk.context;
  if (isMissingContext) {
    blk.context = defaultContext;
    blk.type = defaultBlockType;
  }
  const isUsingBlockStyleMasquerade = blockStyle &&
    blockStyle !== blk.context && blockStyle !== defaultContext;
  if (isUsingBlockStyleMasquerade) {
    blk.context = blockStyle as BlockContext;
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
    BlockAbstract
  >,
  admonition: { context: "admonition", type: "Admonition" } as Partial<
    BlockAdmonition
  >,
  listing: { context: "listing", type: "BlockListing" } as Partial<
    BlockListing
  >,
  literal: { context: "literal", type: "BlockLiteral" } as Partial<
    BlockLiteral
  >,
  partintro: { context: "partintro", type: "BlockPartintro" } as Partial<
    BlockPartintro
  >,
  pass: { context: "pass", type: "BlockPassthrough" } as Partial<
    BlockPassthrough
  >,
  quote: { context: "quote", type: "BlockQuote" } as Partial<BlockQuote>,
  sidebar: { context: "sidebar", type: "BlockSidebar" } as Partial<
    BlockSidebar
  >,
  verse: { context: "verse", type: "BlockVerse" } as Partial<BlockVerse>,
} as Record<BlockContext, Partial<BlockBase<any, any>>>;
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/blocks/masquerading/#built-in-permutations
 */
const rewireBlockForMasquerading = <B extends Partial<BlockStructure>>(
  block: B,
  toContext: string,
): B => {
  const allowed =
    masqueradingFromTo[block.context as keyof typeof masqueradingFromTo];
  if (!allowed) {
    return block;
  }
  const nextAttrs = blocksAttrsByContext[toContext as BlockContext];
  if (allowed.includes(toContext) && nextAttrs) {
    return {
      ...block,
      ...nextAttrs,
    } as B;
  }
  return block;
};
const nev = (_: never) => void 0;
if (getEnvVar("DUMP_GRAMMAR")) {
  console.log(grammarString);
}
