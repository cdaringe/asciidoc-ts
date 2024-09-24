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
interface BaseBlock {
  anchor?: BlockAnchor;
  metadata?: BlockMetaData;
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
  | HeaderSetextBlock
  | HeaderBlock
  | ParagraphBlock
  | UnorderedListBlock
  | OrderedListBlock
  | DescriptionListBlock
  | BlockListing
  | BlockQuote
  | TableBlock
  | HorizontalRuleBlock
  | AdmonitionBlock
  | SidebarBlock
  | BlockPassthrough
  | BlockMacro
  | BlockComment
  | BlankLine;
interface HeaderSetextBlock extends BaseBlock {
  content: string;
  level: 1 | 2;
  type: "HeaderSetext";
}
interface HeaderBlock extends BaseBlock {
  content: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  type: "Header";
}
interface ParagraphBlock extends BaseBlock {
  content: (InlineElement | PlainText)[];
  type: "Paragraph";
}
interface ParagraphSegment {
  content: InlineElement[];
  type: "ParagraphSegment";
}
interface UnorderedListBlock extends BaseBlock {
  items: UnorderedListItem[];
  type: "UnorderedList";
}
interface UnorderedListItem {
  content: InlineElement[];
  depth: number;
  type: "UnorderedListItem";
}
interface OrderedListBlock extends BaseBlock {
  attributes?: AttributeEntry[];
  items: OrderedListItem[];
  type: "OrderedList";
}
interface OrderedListItem {
  content: InlineElement[];
  depth: number;
  type: "OrderedListItem";
}
interface DescriptionListBlock extends BaseBlock {
  items: DescriptionListItem[];
  type: "DescriptionList";
}
interface DescriptionListItem {
  description: InlineElement[];
  term: string;
  type: "DescriptionListItem";
}
/** */
interface BlockListing extends BaseBlock {
  content: string;
  delimited?: boolean;
  type: "ListingBlock";
}
interface CodeBlock extends BaseBlock {
  content: string;
  metadata: {
    attributes: [
      AttributeEntry<"source">,
      ...AttributeEntry[],
    ];
  };
  type: "CodeBlock";
}
interface BlockQuote extends BaseBlock {
  content: Block[];
  type: "BlockQuote";
}
interface TableBlock extends BaseBlock {
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
interface HorizontalRuleBlock extends BaseBlock {
  type: "HorizontalRule";
}
interface AdmonitionBlock extends BaseBlock {
  admonitionType: "NOTE" | "TIP" | "IMPORTANT" | "WARNING" | "CAUTION";
  content: Block[];
  type: "Admonition";
}
interface SidebarBlock extends BaseBlock {
  content: Block[];
  type: "Sidebar";
}
interface BlockPassthrough extends BaseBlock {
  content: string;
  type: "PassthroughBlock";
}
interface BlockMacro extends BaseBlock {
  attributes?: string;
  content: string;
  name: string;
  target?: string;
  type: "MacroBlock";
}
interface AttributeEntry<Name extends string = string> {
  name: Name;
  type: "AttributeEntry";
  value?: string;
}
interface BlockComment extends BaseBlock {
  content: string;
  type: "CommentBlock";
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
interface BlockExample extends BaseBlock {
  content: string;
  delimited: boolean;
  type: "ExampleBlock";
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
interface BlockQuotedParagraph extends BaseBlock {
  citation: string;
  content: string;
  type: "QuotedParagraphBlock";
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
    BlockAdmonition(type, content) {
      return {
        type: "Admonition",
        admonitionType: type.sourceString.slice(0, -1) as
          | "NOTE"
          | "TIP"
          | "IMPORTANT"
          | "WARNING"
          | "CAUTION",
        content: content.toAST(),
      } satisfies AdmonitionBlock;
    },
    anchorReftext(_comma, text) {
      return text.sourceString;
    },
    AttributeEntry(_, name, __, value, _newline) {
      return {
        type: "AttributeEntry",
        name: name.sourceString,
        ...truthyValuesOrEmptyPojo({ value: value.sourceString.trim() }),
      } satisfies AttributeEntry;
    },
    AttributeList(_open, attrs, _close) {
      return attrs.toAST();
    },
    AttributeNamed(key, _eq, value) {
      return {
        type: "AttributeEntry",
        name: key.toAST(),
        value: value ? value.sourceString : undefined,
      } satisfies AttributeEntry;
    },
    AttributePositional(content) {
      return {
        type: "AttributeEntry",
        name: content.sourceString,
      } satisfies AttributeEntry;
    },
    AttributeReference(_, name, __) {
      return {
        type: "AttributeReference",
        name: name.sourceString,
      } satisfies AttributeReference;
    },
    BlankLine(_spaces, _newline) {
      return { type: "BlankLine" } satisfies BlankLine;
    },
    Block(anchor, metadata, blockKind, _nl1, _nl2) {
      const [metadataAst] = metadata.toAST() ?? [];
      const [anchorAst] = anchor.toAST() ?? [];
      const nextBlock = {
        ...blockKind.toAST(),
        ...truthyValuesOrEmptyPojo({ metadata: metadataAst }),
        ...truthyValuesOrEmptyPojo({ anchor: anchorAst }),
      } satisfies Block;
      if (
        nextBlock.type === "Paragraph" &&
        nextBlock.metadata?.attributes?.find((it) => it.name === "listing")
      ) {
        (nextBlock as Block).type = "ListingBlock";
      }
      if (nextBlock.type === "ListingBlock") {
        return maybePromoteToCodeBlock(nextBlock);
      }
      return nextBlock;
    },
    block_title(_, bt, __) {
      return bt.toAST();
    },
    BlockAnchor(_open, id, reftextNode, _close, _nl) {
      // "[[" anchorId anchorReftext?  "]]" newline
      const reftext = reftextNode.toAST();
      return {
        type: "BlockAnchor",
        id: id.sourceString,
        ...(reftext.length ? { reftext } : undefined),
      } satisfies BlockAnchor;
    },
    BlockImage(_img, url, _open, alt, _comma, dims, _close) {
      const ast = this.inlineImage(_img, url, _open, alt, _comma, dims, _close)
        .toAST();
      return {
        ...ast,
        type: "BlockImage",
      } satisfies BlockImage;
    },
    BlockMetaData(titleNode, attributes, _newline) {
      const title = titleNode.toAST();
      return {
        ...(title.length ? { title } : undefined),
        attributes: attributes.toAST(),
      } satisfies BlockMetaData;
    },
    BlockQuote(_open, _newline, content, _close, _newline2) {
      return {
        type: "BlockQuote",
        content: content.toAST(),
      } satisfies BlockQuote;
    },
    BlockComment(_open, _nl1, content, _close, _nl3) {
      return {
        type: "CommentBlock",
        content: content.sourceString,
      } satisfies CommentBlock;
    },
    ConstrainedBold(_, content, __) {
      return {
        type: "ConstrainedBold",
        content: content.toAST(),
      } satisfies ConstrainedBold;
    },
    ConstrainedItalic(_, content, __) {
      return {
        type: "ConstrainedItalic",
        content: content.toAST(),
      } satisfies ConstrainedItalic;
    },
    CrossReference(_, id, text, __) {
      return {
        type: "CrossReference",
        id: id.sourceString,
        text: text.sourceString || null,
      } satisfies CrossReference;
    },
    DescriptionList(items) {
      return {
        type: "DescriptionList",
        items: items.toAST(),
      } satisfies DescriptionListBlock;
    },
    DescriptionListItem(term, _, content) {
      return {
        type: "DescriptionListItem",
        term: term.sourceString.trim(),
        description: content.toAST(),
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
        type: "Document",
        blocks: astBlocks,
      } satisfies Document;
    },
    BlockExample(_open, _nl1, content, _nl2, _close, _nl3) {
      return {
        type: "ExampleBlock",
        content: content.sourceString,
        delimited: true,
      } satisfies ExampleBlock;
    },
    Footnote(_, id, __, text, ___) {
      return {
        type: "Footnote",
        id: id.sourceString || null,
        text: text.toAST(),
      } satisfies Footnote;
    },
    Header(marker, content, _maybeNewline) {
      return {
        type: "Header",
        level: marker.sourceString.length as 1 | 2 | 3 | 4 | 5 | 6,
        content: content.toAST(),
      } satisfies HeaderBlock;
    },
    BlockHeaderSetext(text, underline, _) {
      return {
        type: "HeaderSetext",
        level: underline.sourceString[0] === "=" ? 1 : 2,
        content: text.sourceString.trim(),
      } satisfies HeaderSetextBlock;
    },
    BlockHorizontalRule(_rule, _newline) {
      return { type: "HorizontalRule" } satisfies HorizontalRuleBlock;
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
        type: "InlineImage",
        url: url.sourceString,
        alt: alt.sourceString,
        ...dims.toAST(),
      } satisfies InlineImage;
    },
    InlinePassthrough(_, content, __) {
      return {
        type: "InlinePassthrough",
        content: content.sourceString,
      } satisfies InlinePassthrough;
    },
    line(content, _nl) {
      return content.toAST();
    },
    Link(_, url, __, text, ___) {
      return {
        type: "Link",
        url: url.sourceString,
        text: text.sourceString,
      } satisfies Link;
    },
    ListContinuation(_, _newline, content) {
      return content.toAST();
    },
    ListingBlockDelimited(_d1, _nl1, content, _d2, _newline2) {
      return {
        type: "ListingBlock",
        content: content.sourceString.trim(),
        delimited: true,
      } satisfies ListingBlock;
    },
    ListItemContent(content, continuation, _dunno) {
      return [...content.toAST(), ...(continuation.toAST() || [])];
    },
    BlockMacro(name, _, target, attrs, _newline, content, _close, _newline2) {
      return {
        type: "MacroBlock",
        name: name.sourceString,
        content: content.sourceString,
        ...truthyValuesOrEmptyPojo({ target: target.sourceString }),
        ...truthyValuesOrEmptyPojo({ attributes: attrs.sourceString }),
      } satisfies MacroBlock;
    },
    MonospaceText(_, content, __) {
      return {
        type: "MonospaceText",
        content: content.toAST(),
      } satisfies MonospaceText;
    },
    nonemptyListOf(x, _sep, xs) {
      return [x.toAST()].concat(xs.toAST());
    },
    OrderedList(items) {
      return {
        type: "OrderedList",
        items: normalizeDepth(items.toAST() as OrderedListItem[]),
      } satisfies OrderedListBlock;
    },
    OrderedListItem(marker, content, _nl) {
      return {
        type: "OrderedListItem",
        depth: marker.sourceString.length,
        content: content.toAST(),
      } satisfies OrderedListItem;
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
        type: "Paragraph",
        content: flattenParagraphSegments(content.toAST() as ParagraphSegment),
      } satisfies ParagraphBlock;
    },
    ParagraphSegment(content, _bl, continuation) {
      // ParagraphSegment = InlineElementOrPlainText+ (BlankLine ParagraphSegment)?
      const children = [...content.toAST(), ...(continuation.toAST() || [])];
      return {
        type: "ParagraphSegment",
        content: children,
      } satisfies ParagraphSegment;
    },
    BlockPassthrough(_open, _newline, content, _close, _newline2) {
      return {
        type: "PassthroughBlock",
        content: content.sourceString,
      } satisfies PassthroughBlock;
    },
    plaintext(content) {
      return {
        type: "PlainText",
        content: content.sourceString,
      } satisfies PlainText;
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
        type: "QuotedParagraphBlock",
        content: content.sourceString,
        citation: citation.sourceString,
      } satisfies QuotedParagraphBlock;
    },
    BlockSidebar(_open, _newline, content, _close, _newline2) {
      return {
        type: "Sidebar",
        content: content.toAST(),
      } satisfies SidebarBlock;
    },
    SingleLineText(content, _newline) {
      return {
        type: "SingleLineText",
        content: content.toAST(),
      } satisfies SingleLineText;
    },
    SubscriptText(_, content, __) {
      return {
        type: "SubscriptText",
        content: content.toAST(),
      } satisfies SubscriptText;
    },
    SuperscriptText(_, content, __) {
      return {
        type: "SuperscriptText",
        content: content.toAST(),
      } satisfies SuperscriptText;
    },
    BlockTable(_open, attrs, _newline, rows, _close, _newline2) {
      return {
        type: "Table",
        attributes: attrs.sourceString || null,
        rows: rows.children.map((row) => row.toAST()),
      } satisfies TableBlock;
    },
    TableCell(content) {
      return {
        type: "TableCell",
        content: content.toAST(),
      } satisfies TableCell;
    },
    TableRow(_marker, cells, _markers, _newline, _hmmwrong) {
      debugger; // eslint-disable-line
      return {
        type: "TableRow",
        cells: cells.children.map((cell) => cell.toAST()),
      } satisfies TableRow;
    },
    UnconstrainedBold(_, content, __) {
      return {
        type: "UnconstrainedBold",
        content: content.toAST(),
      } satisfies UnconstrainedBold;
    },
    UnconstrainedItalic(_, content, __) {
      return {
        type: "UnconstrainedItalic",
        content: content.toAST(),
      } satisfies UnconstrainedItalic;
    },
    UnorderedList(items) {
      return {
        type: "UnorderedList",
        items: normalizeDepth(items.toAST() as UnorderedListItem[]),
      } satisfies UnorderedListBlock;
    },
    UnorderedListItem(marker, content, _nl) {
      return {
        type: "UnorderedListItem",
        depth: marker.sourceString.length,
        content: content.toAST(),
      } satisfies UnorderedListItem;
    },
    UrlMacro(scheme, _colon, url, attributes) {
      return {
        type: "UrlMacro",
        scheme: scheme.sourceString,
        url: `${scheme.sourceString}:${url.sourceString}`,
        attributes: attributes.toAST(),
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
const maybePromoteToCodeBlock = (
  listingBlock: ListingBlock,
): BlockListing | CodeBlock => {
  if (listingBlock.metadata?.attributes?.[0]?.name === "source") {
    return {
      ...listingBlock,
      type: "CodeBlock",
    } as CodeBlock;
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
