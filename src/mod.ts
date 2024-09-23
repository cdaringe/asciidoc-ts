import { grammar as ohmGrammar } from "ohm-js";
import { getEnvVar } from "./env.js";

/**
 * Help for generating the grammar from claude.ai
 * @see {@link https://claude.ai/chat/73a7f6fc-66e7-4904-ab7e-d08c0343005e}
 */

const grammarString = String.raw`
AsciiDoc {
  Document = Block* EndOfFile

  AttributeList = "[" listOf<Attribute, ","> "]"
  Attribute = AttributeNamed | AttributePositional
  AttributePositional = (~"]" ~"," any)+
  AttributeNamed = AttributePositional "=" AttributePositional

  Block = BlockMetaData? BlockKind newline? newline?
  BlockMetaData = block_title? AttributeList newline
  block_title = "." ~space (~newline any)* newline
  BlockKind = Header
  | HeaderSetext
  | List
  | Table
  | BlockQuote
  | HorizontalRule
  | Admonition
  | Sidebar
  | PassthroughBlock
  | MacroBlock
  | CommentBlock
  | ListingBlock
  | Paragraph
  | InlineElementOrPlainText
  | BlankLine
  | newline

  LineElementStart = "="

  inlineelstart =
      | "*"  // constrained bold
      | "**"  // unconstrained Bold
      | "_"  // constrained Italics
      | "__"  // Unconstrained Italics
      | "//"  // Italic
      | "${"`"}"   // Monospace
      | "<<"  // Cross-reference start
      | "link:"  // Link start
      | "image:"  // Image start
      | "footnote:"  // Footnote start
      | "+++"  // Inline passthrough start
      | "~"   // Subscript start
      | "^"   // Superscript start
      | "{"   // Attribute reference start

  EndOfFile = newline? end  // Allow optional newline at end of file
  SingleLineText = InlineElement+ newline?

  HeaderSetext = HeaderTextSetext HeaderUnderlineSetext BlankLine*
  HeaderTextSetext = line
  HeaderUnderlineSetext = (("=" | "-")+ newline) | (("=" | "-")+ end)


  Header = HeaderMarker HeaderContent newline?
  HeaderMarker =
  | "======"
  | "====="
  | "===="
  | "==="
  | "=="
  | "="
  HeaderContent = (~newline InlineElementOrPlainText)+

  Paragraph = (~LineElementStart) ParagraphSegment
  ParagraphSegment = InlineElementOrPlainText+ (BlankLine ParagraphSegment)?

  List = UnorderedList
       | OrderedList
       | DescriptionList

  UnorderedList = UnorderedListItem+
  UnorderedListItem = unordered_list_marker ListItemContent newline?
  ListItemContent = InlineElementOrPlainText+ (ListContinuation ListItemContent+)*
  unordered_list_marker = ("*" | "-" | "•")+ space+

  OrderedList = OrderedListItem+
  OrderedListItem = OLMarker ListItemContent newline?
  ol_marker_dot = ". "
  OLMarkerDigits = Digits ol_marker_dot
  OLMarker = OLMarkerDigits | ol_marker_dot

  DescriptionList = DescriptionListItem+
  DescriptionListItem = Term "::" DescriptionContent

  ListContinuation = "+" newline ListItemContent

  Term = (~"::" any)+
  DescriptionContent = line+

  ListingBlock =
    | ListingBlockDelimited

  listingblockdelimiter = "----"

  ListingBlockDelimited = listingblockdelimiter newline (~listingblockdelimiter any)* listingblockdelimiter newline?

  BlockQuote = BlockQuoteDelimiter newline
               (line | BlankLine)*
               BlockQuoteDelimiter newline
  BlockQuoteDelimiter = "____"

  Table = TableDelimiter TableAttributes? newline
          TableRow+
          TableDelimiter newline
  TableDelimiter = "|==="
  TableAttributes = "[" listOf<TableAttribute, ","> "]"
  TableAttribute = ColsAttribute | HeaderOption
  ColsAttribute = "cols" "=" Digits
  HeaderOption = "header"
  TableRow = "|" TableCell ("|" TableCell)* newline
  TableCell = InlineElement+

  HorizontalRule = "'''" newline

  Admonition = AdmonitionType admonitionContent+
  admonitionContent = (~newline any)+
  AdmonitionType = "NOTE:" | "TIP:" | "IMPORTANT:" | "WARNING:" | "CAUTION:"

  Sidebar = SidebarDelimiter newline
            (line | BlankLine)*
            SidebarDelimiter newline
  SidebarDelimiter = "****"

  PassthroughBlock = PassthroughDelimiter newline
                     (line | BlankLine)*
                     PassthroughDelimiter newline
  PassthroughDelimiter = "++++"

  MacroBlock = MacroName "::" MacroTarget? AttributeList? newline
               (line | BlankLine)*
               MacroDelimiter newline
  MacroName = letter+
  MacroTarget = (~"[" any)+

  MacroDelimiter = "----"

  AttributeEntry = ":" AttributeName ":" AttributeValue? newline
  AttributeName = (~":" any)+
  AttributeValue = (~InlineElement any)*

  CommentBlock = CommentDelimiter newline
                 (line | BlankLine)*
                 CommentDelimiter newline
  CommentDelimiter = "////"

  InlineElement =
    | AttributeReference
    | ConstrainedBold
    | ConstrainedItalic
    | CrossReference
    | Footnote
    | InlineImage
    | InlinePassthrough
    | Link
    | MonospaceText
    | SubscriptText
    | SuperscriptText
    | UnconstrainedBold
    | UnconstrainedItalic
    | UrlMacro

  InlineElementOrPlainText = InlineElement | plaintext

  plaintext = (~inlineelstart ~newline ~httpscheme any)+

  ConstrainedBold = "*" (~"*" InlineElementOrPlainText)+ "*"
  UnconstrainedBold = "*" ConstrainedBold "*"

  UnconstrainedItalic = "_" (~"_" InlineElementOrPlainText)+ "_"
  ConstrainedItalic = "_" UnconstrainedItalic "_"

  MonospaceText = "${"`"}" (~"${"`"}" any)+ "${"`"}"
  httpscheme = "https" | "http"
  UrlMacroScheme = httpscheme | "ftp" | "irc" | "mailto"
  UrlMacro = UrlMacroScheme ":" (~"[" any)+ AttributeList

  Link = "link:" Url "[" LinkText "]"
  Url = (~"[" any)+
  LinkText = (~"]" any)*

  InlineImage = "image:" Url "[" ImageAlt "]"
  ImageAlt = (~"]" any)*

  Footnote = "footnote:" FootnoteId? "[" FootnoteText "]"
  FootnoteId = Digits
  FootnoteText = (~"]" any)*

  CrossReference = "<<" CrossReferenceId "," CrossReferenceText? ">>"
  CrossReferenceId = (~"," ~">>" any)+
  CrossReferenceText = (~">>" any)*

  InlinePassthrough = "+++" (~"+++" any)+ "+++"

  SubscriptText = "~" (~"~" any)+ "~"
  SuperscriptText = "^" (~"^" any)+ "^"

  AttributeReference = "{" AttributeName "}"

  line = (~newline any)+ newline
  BlankLine = space* newline

  Digits = digit+

  newline = "\n" | "\r" | "\r\n"
  space := " " --space
    | "\t" --tab
}
`;
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

interface BaseBlock {
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
  attributes: [kind: "source", /* language, ...rest */ ...rest: string[]];
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
  target: string | null;
  attributes: string | null;
  content: string;
}

interface AttributeEntry {
  type: "AttributeEntry";
  name: string;
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

interface InlineImage {
  type: "InlineImage";
  url: string;
  alt: string;
}

interface Footnote {
  type: "Footnote";
  id: string | null;
  text: InlineElement[];
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
      } as BlockMetaData;
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
      } as Document;
    },
    Block(metadata, blockKind, _nl1, _nl2) {
      const [metadataAst] = metadata.toAST() ?? [];
      const nextBlock = {
        ...blockKind.toAST(),
        ...(metadataAst
          ? { metadata: metadataAst }
          : undefined),
      } as Block;
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
      } as HeaderSetextBlock;
    },
    Header(marker, content, _maybeNewline) {
      return {
        type: "Header",
        level: marker.sourceString.length as 1 | 2 | 3 | 4 | 5 | 6,
        content: content.toAST(),
      } as HeaderBlock;
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
      } as ParagraphBlock;
    },
    ParagraphSegment(content, _bl, continuation) {
      // ParagraphSegment = InlineElementOrPlainText+ (BlankLine ParagraphSegment)?
      const children = [...content.toAST(), ...(continuation.toAST() || [])];
      return {
        type: "ParagraphSegment",
        content: children,
      } as ParagraphSegment;
    },
    UnorderedList(items) {
      return {
        type: "UnorderedList",
        items: normalizeDepth(items.toAST() as UnorderedListItem[]),
      } as UnorderedListBlock;
    },
    UnorderedListItem(marker, content, _nl) {
      return {
        type: "UnorderedListItem",
        depth: marker.sourceString.length,
        content: content.toAST(),
      } as UnorderedListItem;
    },
    OrderedList(items) {
      return {
        type: "OrderedList",
        items: normalizeDepth(items.toAST() as OrderedListItem[]),
      } as OrderedListBlock;
    },
    OrderedListItem(marker, content, _nl) {
      return {
        type: "OrderedListItem",
        depth: marker.sourceString.length,
        content: content.toAST(),
      } as OrderedListItem;
    },
    DescriptionList(items) {
      return {
        type: "DescriptionList",
        items: items.toAST(),
      } as DescriptionListBlock;
    },
    DescriptionListItem(term, _, content) {
      return {
        type: "DescriptionListItem",
        term: term.sourceString.trim(),
        description: content.toAST(),
      } as DescriptionListItem;
    },
    ListingBlockDelimited(_d1, _nl1, content, _d2, _newline2) {
      return {
        type: "ListingBlock",
        content: content.sourceString.trim(),
        delimited: true,
      } as ListingBlock;
    },
    BlockQuote(_open, _newline, content, _close, _newline2) {
      return {
        type: "BlockQuote",
        content: content.toAST(),
      } as BlockQuoteBlock;
    },
    Table(_open, attrs, _newline, rows, _close, _newline2) {
      return {
        type: "Table",
        attributes: attrs.sourceString || null,
        rows: rows.children.map((row) => row.toAST()),
      } as TableBlock;
    },
    TableRow(_marker, cells, _markers, _newline, _hmmwrong) {
      debugger; // eslint-disable-line
      return {
        type: "TableRow",
        cells: cells.children.map((cell) => cell.toAST()),
      } as TableRow;
    },
    TableCell(content) {
      return {
        type: "TableCell",
        content: content.toAST(),
      } as TableCell;
    },
    HorizontalRule(_rule, _newline) {
      return { type: "HorizontalRule" } as HorizontalRuleBlock;
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
      } as AdmonitionBlock;
    },
    Sidebar(_open, _newline, content, _close, _newline2) {
      return {
        type: "Sidebar",
        content: content.toAST(),
      } as SidebarBlock;
    },
    PassthroughBlock(_open, _newline, content, _close, _newline2) {
      return {
        type: "PassthroughBlock",
        content: content.sourceString,
      } as PassthroughBlock;
    },
    MacroBlock(name, _, target, attrs, _newline, content, _close, _newline2) {
      return {
        type: "MacroBlock",
        name: name.sourceString,
        target: target.sourceString || null,
        attributes: attrs.sourceString || null,
        content: content.sourceString,
      } as MacroBlock;
    },
    AttributeEntry(_, name, __, value, _newline) {
      return {
        type: "AttributeEntry",
        name: name.sourceString,
        value: value.sourceString.trim() || null,
      } as AttributeEntry;
    },
    AttributePositional(content) {
      return {
        type: "AttributeEntry",
        name: content.sourceString,
      } as AttributeEntry;
    },
    AttributeNamed(key, _eq, value) {
      return {
        type: "AttributeEntry",
        name: key.toAST(),
        value: value ? value.sourceString : undefined,
      } as AttributeEntry;
    },
    CommentBlock(_open, _newline, content, _close, _newline2) {
      return {
        type: "CommentBlock",
        content: content.sourceString,
      } as CommentBlock;
    },
    SingleLineText(content, _newline) {
      return {
        type: "SingleLineText",
        content: content.toAST(),
      } as SingleLineText;
    },
    BlankLine(_spaces, _newline) {
      return { type: "BlankLine" } as BlankLine;
    },
    InlineElement(element) {
      return element.toAST();
    },
    plaintext(content) {
      return {
        type: "PlainText",
        content: content.sourceString,
      } as PlainText;
    },
    ConstrainedBold(_, content, __) {
      return {
        type: "ConstrainedBold",
        content: content.toAST(),
      } as ConstrainedBold;
    },
    UnconstrainedBold(_, content, __) {
      return {
        type: "UnconstrainedBold",
        content: content.toAST(),
      } as UnconstrainedBold;
    },
    UnconstrainedItalic(_, content, __) {
      return {
        type: "UnconstrainedItalic",
        content: content.toAST(),
      } as UnconstrainedItalic;
    },
    ConstrainedItalic(_, content, __) {
      return {
        type: "ConstrainedItalic",
        content: content.toAST(),
      } as ConstrainedItalic;
    },
    MonospaceText(_, content, __) {
      return {
        type: "MonospaceText",
        content: content.toAST(),
      } as MonospaceText;
    },
    Link(_, url, __, text, ___) {
      return {
        type: "Link",
        url: url.sourceString,
        text: text.sourceString,
      } as Link;
    },
    InlineImage(_, url, __, alt, ___) {
      return {
        type: "InlineImage",
        url: url.sourceString,
        alt: alt.sourceString,
      } as InlineImage;
    },
    Footnote(_, id, __, text, ___) {
      return {
        type: "Footnote",
        id: id.sourceString || null,
        text: text.toAST(),
      } as Footnote;
    },
    CrossReference(_, id, __, text, ___) {
      return {
        type: "CrossReference",
        id: id.sourceString,
        text: text.sourceString || null,
      } as CrossReference;
    },
    InlinePassthrough(_, content, __) {
      return {
        type: "InlinePassthrough",
        content: content.sourceString,
      } as InlinePassthrough;
    },
    SubscriptText(_, content, __) {
      return {
        type: "SubscriptText",
        content: content.toAST(),
      } as SubscriptText;
    },
    SuperscriptText(_, content, __) {
      return {
        type: "SuperscriptText",
        content: content.toAST(),
      } as SuperscriptText;
    },
    AttributeReference(_, name, __) {
      return {
        type: "AttributeReference",
        name: name.sourceString,
      } as AttributeReference;
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
      } as UrlMacro;
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
