import { grammar as ohmGrammar } from "ohm-js";
import { getEnvVar } from "./env.js";
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const grammarFilename = path.resolve(__dirname, 'grammar.ohm');

export const grammarString = fs.readFileSync(grammarFilename, 'utf8');
export const grammar = ohmGrammar(grammarString);

// Define types for AST nodes
type ASTNode =
  | Document
  | Block
  | InlineElement;

interface Document {
  type: "Document";
  blocks: Block[];
}

interface BlockAnchor {
  type: "BlockAnchor";
  id: string;
  reftext?: string;
}

interface BaseBlock {
  metadata?: BlockMetaData;
  anchor?: BlockAnchor;
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
  | ListingBlock
  | BlockQuoteBlock
  | TableBlock
  | HorizontalRuleBlock
  | AdmonitionBlock
  | SidebarBlock
  | PassthroughBlock
  | MacroBlock
  | CommentBlock
  | BlankLine;

interface HeaderSetextBlock extends BaseBlock {
  type: "HeaderSetext";
  level: 1 | 2;
  content: string;
}

interface HeaderBlock extends BaseBlock {
  type: "Header";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
}

interface ParagraphBlock extends BaseBlock {
  type: "Paragraph";
  content: (InlineElement | PlainText)[];
}

interface ParagraphSegment {
  type: "ParagraphSegment";
  content: InlineElement[];
}

interface UnorderedListBlock extends BaseBlock {
  type: "UnorderedList";
  items: UnorderedListItem[];
}

interface UnorderedListItem {
  type: "UnorderedListItem";
  depth: number;
  content: InlineElement[];
}

interface OrderedListBlock extends BaseBlock {
  type: "OrderedList";
  items: OrderedListItem[];
  attributes?: AttributeEntry[];
}

interface OrderedListItem {
  type: "OrderedListItem";
  depth: number;
  content: InlineElement[];
}

interface DescriptionListBlock extends BaseBlock {
  type: "DescriptionList";
  items: DescriptionListItem[];
}

interface DescriptionListItem {
  type: "DescriptionListItem";
  term: string;
  description: InlineElement[];
}

/** */
interface ListingBlock extends BaseBlock {
  type: "ListingBlock";
  content: string;
  delimited?: boolean;
}

interface CodeBlock extends BaseBlock {
  type: "CodeBlock";
  metadata: {
    attributes: [AttributeEntry<"source">, ...AttributeEntry[]];
  }
  content: string;
}

interface BlockQuoteBlock extends BaseBlock {
  type: "BlockQuote";
  content: Block[];
}

interface TableBlock extends BaseBlock {
  type: "Table";
  attributes: string | null;
  rows: TableRow[];
}

interface TableRow {
  type: "TableRow";
  cells: TableCell[];
}

interface TableCell {
  type: "TableCell";
  content: InlineElement[];
}

interface HorizontalRuleBlock extends BaseBlock {
  type: "HorizontalRule";
}

interface AdmonitionBlock extends BaseBlock {
  type: "Admonition";
  admonitionType: "NOTE" | "TIP" | "IMPORTANT" | "WARNING" | "CAUTION";
  content: Block[];
}

interface SidebarBlock extends BaseBlock {
  type: "Sidebar";
  content: Block[];
}

interface PassthroughBlock extends BaseBlock {
  type: "PassthroughBlock";
  content: string;
}

interface MacroBlock extends BaseBlock {
  type: "MacroBlock";
  name: string;
  target?: string;
  attributes?: string;
  content: string;
}

interface AttributeEntry<Name extends string = string> {
  type: "AttributeEntry";
  name: Name;
  value?: string;
}

interface CommentBlock extends BaseBlock {
  type: "CommentBlock";
  content: string;
}

interface SingleLineText {
  type: "SingleLineText";
  content: InlineElement[];
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
  type: "PlainText";
  content: string;
}

interface ConstrainedBold {
  type: "ConstrainedBold";
  content: InlineElement[];
}

interface UnconstrainedBold {
  type: "UnconstrainedBold";
  content: InlineElement[];
}

interface UnconstrainedItalic {
  type: "UnconstrainedItalic";
  content: InlineElement[];
}

interface ConstrainedItalic {
  type: "ConstrainedItalic";
  content: InlineElement[];
}

interface MonospaceText {
  type: "MonospaceText";
  content: InlineElement[];
}

interface Link {
  type: "Link";
  url: string;
  text: string;
}

interface ImageCommon {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}
interface InlineImage extends ImageCommon {
  type: "InlineImage";
}

interface BlockImage extends ImageCommon {
  type: "BlockImage";
}

interface Footnote {
  type: "Footnote";
  id: string | null;
  text: InlineElement[];
}

interface ExampleBlock extends BaseBlock {
  type: "ExampleBlock";
  content: string;
  delimited: boolean;
}

interface CrossReference {
  type: "CrossReference";
  id: string;
  text: string | null;
}

interface InlinePassthrough {
  type: "InlinePassthrough";
  content: string;
}

interface SubscriptText {
  type: "SubscriptText";
  content: InlineElement[];
}

interface SuperscriptText {
  type: "SuperscriptText";
  content: InlineElement[];
}

interface AttributeReference {
  type: "AttributeReference";
  name: string;
}

interface QuotedParagraphBlock extends BaseBlock {
  type: "QuotedParagraphBlock";
  content: string;
  citation: string;
}

interface UrlMacro {
  type: "UrlMacro";
  scheme: string;
  url: string;
  attributes?: (string | Record<string, string>)[];
}

export const toAST = (input: string): Document => {
  const semantics = grammar.createSemantics();
  semantics.addOperation("toAST", {
    BlockMetaData(titleNode, attributes, _newline) {
      const title = titleNode.toAST();
      return {
        ...(title.length ? { title } : undefined),
        attributes: attributes.toAST(),
      } satisfies BlockMetaData;
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
    ExampleBlock(_open, _nl1, content, _nl2, _close, _nl3) {
      return {
        type: "ExampleBlock",
        content: content.sourceString,
        delimited: true,
      } satisfies ExampleBlock;
    },
    anchorReftext(_comma, text) {
      return text.sourceString;
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
    Block(anchor,metadata, blockKind, _nl1, _nl2) {
      const [metadataAst] = metadata.toAST() ?? [];
      const [anchorAst] = anchor.toAST() ?? [];
      const nextBlock = {
        ...blockKind.toAST(),
        ...truthyValuesOrEmptyPojo({ metadata: metadataAst }),
        ...truthyValuesOrEmptyPojo({ anchor: anchorAst }),
      } satisfies Block;
      if (nextBlock.type === 'Paragraph' && nextBlock.metadata?.attributes?.find(it => it.name === 'listing')) {
        (nextBlock as Block).type = 'ListingBlock';
      }
      if (nextBlock.type === "ListingBlock") {
        return maybePromoteToCodeBlock(nextBlock);
      }
      return nextBlock;
    },
    HeaderSetext(text, underline, _) {
      return {
        type: "HeaderSetext",
        level: underline.sourceString[0] === "=" ? 1 : 2,
        content: text.sourceString.trim(),
      } satisfies HeaderSetextBlock;
    },
    Header(marker, content, _maybeNewline) {
      return {
        type: "Header",
        level: marker.sourceString.length as 1 | 2 | 3 | 4 | 5 | 6,
        content: content.toAST(),
      } satisfies HeaderBlock;
    },
    Paragraph(content) {
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
    OrderedList(items) {
      return {
        type: "OrderedList",
        items: normalizeDepth(items.toAST() as OrderedListItem[]),
      } satisfies OrderedListBlock;
    },
    QuotedParagraphBlock(_open, content, _closed, _newline, _attribution, citation, _newline2) {
      // QuotedParagraphBlock = '"' (~'"' any)* '"' newline "--" plaintext? newline
      return {
        type: "QuotedParagraphBlock",
        content: content.sourceString,
        citation: citation.sourceString,
      } satisfies QuotedParagraphBlock;
    },
    OrderedListItem(marker, content, _nl) {
      return {
        type: "OrderedListItem",
        depth: marker.sourceString.length,
        content: content.toAST(),
      } satisfies OrderedListItem;
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
    ListingBlockDelimited(_d1, _nl1, content, _d2, _newline2) {
      return {
        type: "ListingBlock",
        content: content.sourceString.trim(),
        delimited: true,
      } satisfies ListingBlock;
    },
    BlockQuote(_open, _newline, content, _close, _newline2) {
      return {
        type: "BlockQuote",
        content: content.toAST(),
      } satisfies BlockQuoteBlock;
    },
    Table(_open, attrs, _newline, rows, _close, _newline2) {
      return {
        type: "Table",
        attributes: attrs.sourceString || null,
        rows: rows.children.map((row) => row.toAST()),
      } satisfies TableBlock;
    },
    TableRow(_marker, cells, _markers, _newline, _hmmwrong) {
      debugger; // eslint-disable-line
      return {
        type: "TableRow",
        cells: cells.children.map((cell) => cell.toAST()),
      } satisfies TableRow;
    },
    TableCell(content) {
      return {
        type: "TableCell",
        content: content.toAST(),
      } satisfies TableCell;
    },
    HorizontalRule(_rule, _newline) {
      return { type: "HorizontalRule" } satisfies HorizontalRuleBlock;
    },
    Admonition(type, content) {
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
    Sidebar(_open, _newline, content, _close, _newline2) {
      return {
        type: "Sidebar",
        content: content.toAST(),
      } satisfies SidebarBlock;
    },
    PassthroughBlock(_open, _newline, content, _close, _newline2) {
      return {
        type: "PassthroughBlock",
        content: content.sourceString,
      } satisfies PassthroughBlock;
    },
    MacroBlock(name, _, target, attrs, _newline, content, _close, _newline2) {
      return {
        type: "MacroBlock",
        name: name.sourceString,
        content: content.sourceString,
        ...truthyValuesOrEmptyPojo({ target: target.sourceString }),
        ...truthyValuesOrEmptyPojo({ attributes: attrs.sourceString }),
      } satisfies MacroBlock;
    },
    AttributeEntry(_, name, __, value, _newline) {
      return {
        type: "AttributeEntry",
        name: name.sourceString,
        ...truthyValuesOrEmptyPojo({ value: value.sourceString.trim() }),
      } satisfies AttributeEntry;
    },
    AttributePositional(content) {
      return {
        type: "AttributeEntry",
        name: content.sourceString,
      } satisfies AttributeEntry;
    },
    AttributeNamed(key, _eq, value) {
      return {
        type: "AttributeEntry",
        name: key.toAST(),
        value: value ? value.sourceString : undefined,
      } satisfies AttributeEntry;
    },
    CommentBlock(_open, _nl1, content, _close, _nl3) {
      return {
        type: "CommentBlock",
        content: content.sourceString,
      } satisfies CommentBlock;
    },
    SingleLineText(content, _newline) {
      return {
        type: "SingleLineText",
        content: content.toAST(),
      } satisfies SingleLineText;
    },
    BlankLine(_spaces, _newline) {
      return { type: "BlankLine" } satisfies BlankLine;
    },
    InlineElement(element) {
      return element.toAST();
    },
    plaintext(content) {
      return {
        type: "PlainText",
        content: content.sourceString,
      } satisfies PlainText;
    },
    ConstrainedBold(_, content, __) {
      return {
        type: "ConstrainedBold",
        content: content.toAST(),
      } satisfies ConstrainedBold;
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
    ConstrainedItalic(_, content, __) {
      return {
        type: "ConstrainedItalic",
        content: content.toAST(),
      } satisfies ConstrainedItalic;
    },
    MonospaceText(_, content, __) {
      return {
        type: "MonospaceText",
        content: content.toAST(),
      } satisfies MonospaceText;
    },
    Link(_, url, __, text, ___) {
      return {
        type: "Link",
        url: url.sourceString,
        text: text.sourceString,
      } satisfies Link;
    },
    ImageDims(width, _comma, height) {
      const widthNum = width.sourceString ? parseInt(width.sourceString) : undefined;
      const heightNum = height.sourceString ? parseInt(height.sourceString) : undefined;
      return {
        ...(widthNum ? { width: widthNum } : undefined),
        ...(heightNum ? { height: heightNum } : undefined),
      };
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
    BlockImage(_img, url, _open, alt, _comma, dims, _close) {
      const ast = this.inlineImage(_img, url, _open, alt, _comma, dims, _close).toAST();
      return {
        ...ast,
        type: "BlockImage",
      } satisfies BlockImage;
    },
    Footnote(_, id, __, text, ___) {
      return {
        type: "Footnote",
        id: id.sourceString || null,
        text: text.toAST(),
      } satisfies Footnote;
    },
    CrossReference(_, id, text, __) {
      return {
        type: "CrossReference",
        id: id.sourceString,
        text: text.sourceString || null,
      } satisfies CrossReference;
    },
    InlinePassthrough(_, content, __) {
      return {
        type: "InlinePassthrough",
        content: content.sourceString,
      } satisfies InlinePassthrough;
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
    AttributeReference(_, name, __) {
      return {
        type: "AttributeReference",
        name: name.sourceString,
      } satisfies AttributeReference;
    },
    ListItemContent(content, continuation, _dunno) {
      return [...content.toAST(), ...(continuation.toAST() || [])];
    },
    ListContinuation(_, _newline, content) {
      return content.toAST();
    },
    UrlMacro(scheme, _colon, url, attributes) {
      return {
        type: "UrlMacro",
        scheme: scheme.sourceString,
        url: `${scheme.sourceString}:${url.sourceString}`,
        attributes: attributes.toAST(),
      } satisfies UrlMacro;
    },
    AttributeList(_open, attrs, _close) {
      return attrs.toAST();
    },
    nonemptyListOf(x, _sep, xs) {
      return [x.toAST()].concat(xs.toAST());
    },
    block_title(_, bt, __) {
      return bt.toAST();
    },
    line(content, _nl) {
      return content.toAST();
    },
    _terminal() {
      return this.sourceString;
    },
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
): ListingBlock | CodeBlock => {
  if (listingBlock.metadata?.attributes?.[0]?.name === "source") {
    return {
      ...listingBlock,
      type: "CodeBlock",
    } as CodeBlock;
  }
  return listingBlock;
};

const normalizeDepth = <T extends { depth: number }>(items: T[]): T[] => {
  const commonDepth = Math.min(...items.map((it) => it.depth));
  if (commonDepth > 1) {
    items.forEach((it) => it.depth -= commonDepth);
  }
  return items;
};


const truthyValuesOrEmptyPojo = <T extends Record<string,any>>(it: T): T | {} => {
  for (const key in it) {
    if (it[key] == null) {
      return {};
    }
  }
  return it;
}
