export type ASTNode = Document | Block | InlineElement;
/**
 * Ephemeral nodes used while converting lexed tokens to public ASTNodes.
 */
export type ParsingNode =
  | ASTNode
  // uhhh i don't know how to categorize these Nodes yet
  | LexOnlyASTNode;
export type LexOnlyASTNode = AttributeEntry | Terminal;
export interface Terminal {
  content: string;
  type: "Terminal";
}
export interface Document {
  blocks: Block[];
  type: "Document";
}
export interface BlockAnchor {
  id: string;
  reftext?: string;
  type: "BlockAnchor";
}
/**
 * https://docs.asciidoctor.org/asciidoc/latest/blocks/#summary-of-built-in-contexts
 */
export type BlockContext =
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
export type BlockModel =
  | "compound"
  | "simple"
  | "verbatim"
  | "raw"
  | "empty"
  | "table"
  | "unknown";
export type InlineElementOrPlainText = InlineElement | PlainText;
export interface BlockBase<C extends BlockContext, M extends BlockModel> {
  anchor?: BlockAnchor;
  metadata?: BlockMetaData;
  delimiter?: string;
  context: C;
  content: M extends "compound" ? Block[]
    : M extends "simple" ? (InlineElementOrPlainText[])
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
export interface BlockMetaData {
  attributes?: AttributeEntry[];
  id?: string;
  options?: string[];
  roles?: string[];
  title?: string;
}
export type Block =
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
  | BlockSource
  | BlankLine
  | BlockPassthrough
  | BlockQuote
  | BlockSidebar
  | BlockComment
  | BlockLiteral;
export type BlockStructure = Block extends {
  content: any;
} ? Block
  : never;
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/sections/titles-and-levels/
 * @warn Counter to the documentation, we model the section as simple vs compound, and the header is itself the content.
 */
export interface BlockSectionSetext extends BlockBase<"section", "empty"> {
  level: 1 | 2;
  type: "HeaderSetext";
}
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/sections/titles-and-levels/
 * @warn Counter to the documentation, we model the section as simple vs compound, and the header is itself the content.
 */
export interface BlockSection extends BlockBase<"section", "empty"> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  type: "Header";
}
export interface BlockParagraph extends BlockBase<"paragraph", "simple"> {
  type: "BlockParagraph";
}
export interface BlockAbstract extends BlockBase<"abstract", "simple"> {
  type: "BlockAbstract";
}
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/sections/parts/#part-intro
 */
export interface BlockPartintro extends BlockBase<"partintro", "simple"> {
  type: "BlockPartintro";
}
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/pass/pass-block/
 */
export interface BlockPassthrough extends BlockBase<"pass", "verbatim"> {
  type: "BlockPassthrough";
}
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/verbatim/literal-blocks/
 */
export interface BlockLiteral extends BlockBase<"literal", "verbatim"> {
  type: "BlockLiteral";
}
export interface ParagraphSegment {
  content: InlineElement[];
  type: "ParagraphSegment";
}
export interface BlockList
  extends Omit<BlockBase<"dlist" | "olist" | "ulist", "simple">, "content"> {
  content: ListItem[];
  type: "BlockList";
  ordered: boolean;
}
export interface ListItem {
  content: InlineElement[];
  depth: number;
  type: "ListItem";
}
export interface BlockOrderedList
  extends Omit<BlockBase<"olist", "simple">, "content"> {
  attributes?: AttributeEntry[];
  content: OrderedListItem[];
  type: "OrderedList";
}
export interface OrderedListItem {
  content: InlineElement[];
  depth: number;
  type: "OrderedListItem";
}
export interface BlockDescriptionList
  extends Omit<BlockBase<"dlist", "simple">, "content"> {
  content: DescriptionListItem[];
  type: "DescriptionList";
}
export interface DescriptionListItem {
  description: InlineElement[];
  term: string;
  type: "DescriptionListItem";
}
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/verbatim/listing-blocks/
 */
export interface BlockListing extends BlockBase<"listing", "verbatim"> {
  delimited?: boolean;
  type: "BlockListing";
}
export interface BlockSource extends BlockBase<"listing", "verbatim"> {
  type: "BlockSource";
}
export interface BlockQuote extends BlockBase<"quote", "simple"> {
  type: "BlockQuote";
}
export interface BlockTable extends BlockBase<"table", "table"> {
  type: "BlockTable";
}
export interface TableRow {
  content: TableCell[];
  type: "TableRow";
}
export interface TableCell {
  content: InlineElement[];
  type: "TableCell";
}
export interface BlockHorizontalRule
  extends BlockBase<"thematic_break", "empty"> {
  type: "HorizontalRule";
}
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/blocks/admonitions/
 */
export interface BlockAdmonition extends BlockBase<"admonition", "simple"> {
  admonitionType: "NOTE" | "TIP" | "IMPORTANT" | "WARNING" | "CAUTION";
  type: "BlockAdmonition";
}
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/blocks/sidebars/
 */
export interface BlockSidebar extends BlockBase<"sidebar", "simple"> {
  type: "BlockSidebar";
}
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/blocks/verses/
 */
export interface BlockVerse extends BlockBase<"verse", "simple"> {
  type: "BlockVerse";
}
/**
 * @see https://docs.asciidoctor.org/asciidoc/latest/verbatim/literal-blocks/
 */
export interface BlockLiteral extends BlockBase<"literal", "verbatim"> {
  type: "BlockLiteral";
}
export interface BlockMacro extends BlockBase<"macro", "verbatim"> {
  attributes?: string;
  name: string;
  target?: string;
  type: "BlockMacro";
}
export interface AttributeEntry<Name extends string = string> {
  name: Name;
  type: "AttributeEntry";
  value?: PlainText[];
}
export interface BlockComment extends BlockBase<"comment", "verbatim"> {
  type: "BlockComment";
}
export interface SingleLineText {
  content: InlineElement[];
  type: "SingleLineText";
}
export interface BlankLine extends BlockBase<"blank_line", "simple"> {
  type: "BlankLine";
}
export interface BlockExample extends BlockBase<"example", "simple"> {
  type: "BlockExample";
}
export type InlineElement =
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
export interface PlainText {
  content: string;
  type: "PlainText";
}
export interface ConstrainedBold {
  content: InlineElement[];
  type: "ConstrainedBold";
}
export interface UnconstrainedBold {
  content: InlineElement[];
  type: "UnconstrainedBold";
}
export interface UnconstrainedItalic {
  content: InlineElement[];
  type: "UnconstrainedItalic";
}
export interface ConstrainedItalic {
  content: InlineElement[];
  type: "ConstrainedItalic";
}
export interface MonospaceText {
  content: InlineElement[];
  type: "MonospaceText";
}
export interface Link {
  text: string;
  type: "Link";
  url: string;
}
export interface ImageCommon {
  alt: string;
  height?: number;
  url: string;
  width?: number;
}
export interface InlineImage extends ImageCommon {
  type: "InlineImage";
}
export interface BlockImage extends ImageCommon {
  type: "BlockImage";
}
export interface Footnote {
  id: string | null;
  text: InlineElement[];
  type: "Footnote";
}
export interface CrossReference {
  id: string;
  text: string | null;
  type: "CrossReference";
}
export interface InlinePassthrough {
  content: string;
  type: "InlinePassthrough";
}
export interface SubscriptText {
  content: InlineElement[];
  type: "SubscriptText";
}
export interface SuperscriptText {
  content: InlineElement[];
  type: "SuperscriptText";
}
export interface AttributeReference {
  name: string;
  type: "AttributeReference";
}
export interface BlockQuotedParagraph extends BlockBase<"quote", "simple"> {
  citation: string;
  type: "BlockQuotedParagraph";
}
export interface UrlMacro {
  attributes?: (string | Record<string, string>)[];
  scheme: string;
  type: "UrlMacro";
  url: string;
}
