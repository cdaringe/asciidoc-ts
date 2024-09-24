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
type BlockContext =
  | "admonition"
  | "comment"
  | "descriptionlist"
  | "example"
  | "header"
  | "horizontalrule"
  | "list"
  | "listing"
  | "macro"
  | "paragraph"
  | "passthrough"
  | "quote"
  | "sidebar"
  | "source"
  | "table"
  | "unknown";
interface BlockBase<C extends BlockContext> {
  anchor?: BlockAnchor;
  metadata?: BlockMetaData;
  delimiter?: string;
  context: C;
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
  | BlockHeaderSetext
  | BlockHeader
  | BlockParagraph
  | BlockUnorderedList
  | BlockOrderedList
  | BlockDescriptionList
  | BlockListing
  | BlockQuote
  | BlockTable
  | BlockHorizontalRule
  | BlockAdmonition
  | BlockSidebar
  | BlockPassthrough
  | BlockMacro
  | BlockComment
  | BlankLine;
type BlockStructure = Block;
interface BlockHeaderSetext extends BlockBase<"header"> {
  content: string;
  level: 1 | 2;
  type: "HeaderSetext";
}
interface BlockHeader extends BlockBase<"header"> {
  content: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  type: "Header";
}
interface BlockParagraph extends BlockBase<"paragraph"> {
  content: (InlineElement | PlainText)[];
  type: "Paragraph";
}
interface ParagraphSegment {
  content: InlineElement[];
  type: "ParagraphSegment";
}
interface BlockUnorderedList extends BlockBase<"list"> {
  items: UnorderedListItem[];
  type: "UnorderedList";
}
interface UnorderedListItem {
  content: InlineElement[];
  depth: number;
  type: "UnorderedListItem";
}
interface BlockOrderedList extends BlockBase<"list"> {
  attributes?: AttributeEntry[];
  items: OrderedListItem[];
  type: "OrderedList";
}
interface OrderedListItem {
  content: InlineElement[];
  depth: number;
  type: "OrderedListItem";
}
interface BlockDescriptionList extends BlockBase<"list"> {
  items: DescriptionListItem[];
  type: "DescriptionList";
}
interface DescriptionListItem {
  description: InlineElement[];
  term: string;
  type: "DescriptionListItem";
}
/** */
interface BlockListing extends BlockBase<"listing"> {
  content: string;
  delimited?: boolean;
  type: "BlockListing";
}
interface BlockSource extends BlockBase<"source"> {
  content: string;
  metadata: {
    attributes: [
      AttributeEntry<"source">,
      ...AttributeEntry[],
    ];
  };
  type: "BlockSource";
}
interface BlockQuote extends BlockBase<"quote"> {
  content: Block[];
  type: "BlockQuote";
}
interface BlockTable extends BlockBase<"table"> {
  attributes: string | null;
  rows: TableRow[];
  type: "Table";
}
interface TableRow {
  cells: TableCell[];
  type: "TableRow";
}
interface TableCell {
  content: InlineElement[];
  type: "TableCell";
}
interface BlockHorizontalRule extends BlockBase<"horizontalrule"> {
  type: "HorizontalRule";
}
interface BlockAdmonition extends BlockBase<"admonition"> {
  admonitionType: "NOTE" | "TIP" | "IMPORTANT" | "WARNING" | "CAUTION";
  content: Block[];
  type: "Admonition";
}
interface BlockSidebar extends BlockBase<"sidebar"> {
  content: Block[];
  type: "Sidebar";
}
interface BlockPassthrough extends BlockBase<"passthrough"> {
  content: string;
  type: "BlockPassthrough";
}
interface BlockMacro extends BlockBase<"macro"> {
  attributes?: string;
  content: string;
  name: string;
  target?: string;
  type: "BlockMacro";
}
interface AttributeEntry<Name extends string = string> {
  name: Name;
  type: "AttributeEntry";
  value?: string;
}
interface BlockComment extends BlockBase<"comment"> {
  content: string;
  type: "BlockComment";
}
interface SingleLineText {
  content: InlineElement[];
  type: "SingleLineText";
}
interface BlankLine {
  type: "BlankLine";
}
type InlineElement =
  | PlainText
  | ConstrainedBold
  | UnconstrainedBold
  | ConstrainedItalic
  | UnconstrainedItalic
  | MonospaceText
  | Link
  | InlineImage
  | Footnote
  | CrossReference
  | InlinePassthrough
  | SubscriptText
  | SuperscriptText
  | AttributeReference;
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
interface BlockExample extends BlockBase<"example"> {
  content: string;
  delimited: boolean;
  type: "BlockExample";
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
interface BlockQuotedParagraph extends BlockBase<"quote"> {
  citation: string;
  content: string;
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
      return { type: "BlankLine" } satisfies BlankLine;
    },
    Block(blockStructureNode) {
      const blockStructureAst = blockStructureNode.toAST();
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
    BlockComment(_open, _nl1, content, _close, _nl3) {
      return {
        content: content.sourceString,
        context: "comment",
        type: "BlockComment",
      } satisfies BlockComment;
    },
    BlockExample(_open, _nl1, content, _nl2, _close, _nl3) {
      return {
        content: content.sourceString,
        context: "example",
        delimited: true,
        type: "BlockExample",
      } satisfies BlockExample;
    },
    BlockHeaderSetext(text, underline, _) {
      return {
        content: text.sourceString.trim(),
        context: "header",
        level: underline.sourceString[0] === "=" ? 1 : 2,
        type: "HeaderSetext",
      } satisfies BlockHeaderSetext;
    },
    BlockHorizontalRule(_rule, _newline) {
      return {
        context: "horizontalrule",
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
    BlockListingDelimited(_d1, _nl1, content, _d2, _newline2) {
      return {
        content: content.sourceString.trim(),
        context: "listing",
        delimited: true,
        type: "BlockListing",
      } satisfies BlockListing;
    },
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
    BlockPassthrough(_open, _newline, content, _close, _newline2) {
      return {
        content: content.sourceString,
        context: "passthrough",
        type: "BlockPassthrough",
      } satisfies BlockPassthrough;
    },
    BlockQuote(_open, _newline, content, _close, _newline2) {
      return {
        content: content.toAST(),
        context: "quote",
        type: "BlockQuote",
      } satisfies BlockQuote;
    },
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
        content: content.sourceString,
        context: "quote",
        type: "BlockQuotedParagraph",
      } satisfies BlockQuotedParagraph;
    },
    BlockSidebar(_open, _newline, content, _close, _newline2) {
      return {
        content: content.toAST(),
        context: "sidebar",
        type: "Sidebar",
      } satisfies BlockSidebar;
    },
    BlockStructure(anchor, metadata, blockKind, _nl1, _nl2) {
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
    BlockTable(_open, attrs, _newline, rows, _close, _newline2) {
      return {
        attributes: attrs.sourceString || null,
        context: "table",
        rows: rows.children.map((row) => row.toAST()),
        type: "Table",
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
        context: "list",
        items: items.toAST(),
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
        context: "header",
        level: marker.sourceString.length as 1 | 2 | 3 | 4 | 5 | 6,
        type: "Header",
      } satisfies BlockHeader;
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
        context: "list",
        items: normalizeDepth(items.toAST() as OrderedListItem[]),
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
    plaintext(content) {
      return {
        content: content.sourceString,
        type: "PlainText",
      } satisfies PlainText;
    },
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
      debugger; // eslint-disable-line
      return {
        cells: cells.children.map((cell) => cell.toAST()),
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
        context: "list",
        items: normalizeDepth(items.toAST() as UnorderedListItem[]),
        type: "UnorderedList",
      } satisfies BlockUnorderedList;
    },
    UnorderedListItem(marker, content, _nl) {
      return {
        content: content.toAST(),
        depth: marker.sourceString.length,
        type: "UnorderedListItem",
      } satisfies UnorderedListItem;
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
if (getEnvVar("DUMP_GRAMMAR")) {
  console.log(grammarString);
} else if (getEnvVar("DUMP_AST")) {
  const input = `= Header
  Some paragraph text

  * Item 1
  **Bold text**
  *Italic text*
  1. Ordered Item

  | Cell 1 | Cell 2 |
  | Cell 3 | Cell 4 |

  Macro::[arg,arg2]`;
  const out = toAST(input);
  console.log(JSON.stringify(out.blocks, null, 2));
}
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
      context: "source",
      metadata: {
        ...metadata,
        attributes: metadata
          .attributes as BlockSource["metadata"]["attributes"],
      },
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
