import { grammar } from "./grammar.js";
import { Result } from "./result.js";
import * as t from "./ast-types.js";
import { truthyValuesOrEmptyPojo } from "./collection.js";
import { toDerivedBlockType } from "./block.js";
import { normalizeDepth } from "./list.js";
import { MatchResult } from "ohm-js";
import { ASTGuards, createASTReader } from "./ast-reader.js";

export const createSemantics = (guards?: ASTGuards) => {
  const readAST = createASTReader(guards);
  const defaultToAST = (it: any) => readAST<any>(it, "semantic");
  const semantics = grammar.createSemantics();
  semantics.addOperation<any>("toAST", {
    _iter(...children) {
      const next = children.map((child) => readAST<any>(child, "semantic"));
      if (
        typeof next[0] === "string" &&
        next.every((it) => typeof it === "string")
      ) {
        return {
          content: next.join(""),
          type: "PlainText",
        } satisfies t.PlainText;
      }
      return next;
    },
    _terminal() {
      return this.sourceString;
    },
    anchor_reftext(_comma, text) {
      return readAST<any>(text, "semantic");
    },
    Attribute: defaultToAST,
    AttributeEntry(_, name, __, value, _newline) {
      return {
        ...truthyValuesOrEmptyPojo({ value: readAST<any>(value, "semantic") }),
        name: name.sourceString,
        type: "AttributeEntry",
      } satisfies t.AttributeEntry;
    },
    AttributeList: (_open, attrs, _close) => readAST<any[]>(attrs, "array"),
    AttributeNamed(key, _eq, value) {
      return {
        ...truthyValuesOrEmptyPojo({ value: readAST<any>(value, "semantic") }),
        name: key.sourceString,
        type: "AttributeEntry",
      } satisfies t.AttributeEntry;
    },
    AttributePositional(content) {
      return {
        name: content.sourceString,
        type: "AttributePositional",
      } satisfies t.AttributePositional;
    },
    AttributeReference(_, name, __) {
      return {
        name: name.sourceString,
        type: "AttributeReference",
      } satisfies t.AttributeReference;
    },
    AttributeValue: defaultToAST,
    BlankLine(spaces, newline) {
      return {
        content: [
          ...readAST<any[]>(spaces, "array"),
          readAST<any>(newline, "semantic"),
        ],
        context: "blank_line",
        type: "BlankLine",
      } satisfies t.BlankLine;
    },
    Block(blockStructureNode) {
      // const blockStructureAst = getCheckedAST<BlockStructure>(blockStructureNode, "BlockStructure");
      const blockStructureAst = readAST<t.BlockStructure>(
        blockStructureNode,
        "record",
      );
      const nextBlock = toDerivedBlockType(blockStructureAst);
      return nextBlock;
    },
    block_title(_, bt, __) {
      return bt.sourceString;
    },
    BlockAdmonition(type, content) {
      // BlockAdmonition = AdmonitionType any_non_newline+
      return {
        admonitionType: type.sourceString.slice(0, -1) as
          | "NOTE"
          | "TIP"
          | "IMPORTANT"
          | "WARNING"
          | "CAUTION",
        content: readAST<any>(content, "semantic"),
        context: "admonition",
        type: "BlockAdmonition",
      } satisfies t.BlockAdmonition;
    },
    BlockAnchor(_open, id, reftextNode, _close, _nl) {
      // "[[" anchorId anchor_reftext?  "]]" newline
      const reftext = reftextNode.sourceString;
      return {
        ...truthyValuesOrEmptyPojo({ reftext }),
        id: id.sourceString,
        type: "BlockAnchor",
      } satisfies t.BlockAnchor;
    },
    BlockContentGeneric(firstNode, recursiveNode) {
      const hd = readAST<any>(firstNode, "semantic");
      const tail = readAST<any[]>(recursiveNode, "array") || [];
      return [...(Array.isArray(hd) ? hd : [hd]), ...tail.flat()];
    },
    BlockContentGenericLineEmpty: defaultToAST,
    BlockContentGenericLineFull(_nl, contentN) {
      // BlockContentGenericFull<delim> = blank_lines? (~delim InlineElementOrText<delim>)+ BlockContentGeneric<delim>?
      const tail = readAST<any[]>(contentN, "array") ?? [];
      return tail.flat();
    },
    BlockHorizontalRule(_rule, _newline) {
      return {
        content: undefined,
        context: "thematic_break",
        type: "HorizontalRule",
      } satisfies t.BlockHorizontalRule;
    },
    BlockImage(_img, url, _open, alt, _comma, dims, _close) {
      return {
        ...this.InlineImage(
          _img,
          url,
          _open,
          alt,
          _comma,
          dims,
          _close,
        ) as t.InlineImage,
        type: "BlockImage",
      } satisfies t.BlockImage;
    },
    BlockList: defaultToAST,
    BlockMacro(name, _, target, attrs, _newline, content, _close, _newline2) {
      return {
        ...truthyValuesOrEmptyPojo({ target: target.sourceString }),
        ...truthyValuesOrEmptyPojo({ attributes: attrs.sourceString }),
        content: content.sourceString,
        context: "macro",
        name: name.sourceString,
        type: "BlockMacro",
      } satisfies t.BlockMacro;
    },
    BlockMetaData(titleNode, attributes, _newline) {
      const title = readAST<any>(titleNode, "semantic");
      return {
        ...truthyValuesOrEmptyPojo({ title }),
        attributes: readAST<t.Attribute[]>(attributes, "array"),
      } satisfies t.BlockMetaData;
    },
    BlockParagraph(content) {
      const flattenParagraphSegments = (
        it: t.InlineElement | t.PlainText | t.ParagraphSegment,
      ): (t.InlineElement | t.PlainText)[] => {
        if (it.type === "ParagraphSegment") {
          return it.content.flatMap(flattenParagraphSegments);
        }
        return [it];
      };
      return {
        content: flattenParagraphSegments(
          readAST<t.ParagraphSegment>(content, { type: "ParagraphSegment" }),
        ),
        context: "paragraph",
        type: "BlockParagraph",
      } satisfies t.BlockParagraph;
    },
    BlockQuotedParagraph(
      _open,
      content,
      _close,
      _newline,
      _attributiondashdash,
      citation,
      _newline2,
    ) {
      return {
        citation: citation.sourceString,
        content: readAST<any>(content, "semantic"),
        context: "quote",
        type: "BlockQuotedParagraph",
      } satisfies t.BlockQuotedParagraph;
    },
    BlockSectionSetext(text, underline, _) {
      return {
        content: readAST<any>(text, "semantic"),
        context: "section",
        level: underline.sourceString[0] === "=" ? 1 : 2,
        type: "HeaderSetext",
      } satisfies t.BlockSectionSetext;
    },
    BlockStructure(anchor, metadata, blockKind, _nl1, _nl2) {
      const [metadataAst] = readAST<t.BlockMetaData[]>(metadata, "array") ?? [];
      const [anchorAst] = readAST<t.BlockAnchor[]>(anchor, "array") ?? [];
      const blockKindAST = readAST<t.BlockStructure>(blockKind, "record");
      const nextBlock: t.BlockStructure = {
        ...blockKindAST,
        ...truthyValuesOrEmptyPojo({ metadata: metadataAst }),
        ...truthyValuesOrEmptyPojo({ anchor: anchorAst }),
      } satisfies t.BlockStructure;
      // if (
      //   nextBlock.type === "Paragraph" &&
      //   nextBlock.metadata?.attributes?.find((it) => it.name === "listing")
      // ) {
      //   (nextBlock as t.Block).type = "BlockListing";
      // }
      return nextBlock;
    },
    BlockTable(rows) {
      return {
        content: readAST<t.TableRow[]>(rows, "array"),
        context: "table",
        type: "BlockTable",
      } satisfies t.BlockTable;
    },
    ConstrainedBold(_, content, __) {
      return {
        content: readAST<any>(content, "semantic"),
        type: "ConstrainedBold",
      } satisfies t.ConstrainedBold;
    },
    ConstrainedItalic(_, content, __) {
      return {
        content: readAST<any>(content, "semantic"),
        type: "ConstrainedItalic",
      } satisfies t.ConstrainedItalic;
    },
    CrossReference(_, id, text, __) {
      return {
        ...truthyValuesOrEmptyPojo({ text: readAST<any>(text, "semantic") }),
        id: id.sourceString,
        type: "CrossReference",
      } satisfies t.CrossReference;
    },
    CrossReferenceId: defaultToAST, // (~"," ~">>" any)+
    CrossReferenceText: (_comma, text) => {
      return readAST<any>(text, "semantic");
    },
    DescriptionList(items) {
      return {
        content: readAST<t.DescriptionListItem[]>(items, "array"),
        context: "dlist",
        type: "DescriptionList",
      } satisfies t.BlockDescriptionList;
    },
    DescriptionListItem(term, _, content) {
      return {
        description: readAST<any>(content, "semantic"),
        term: term.sourceString.trim(),
        type: "DescriptionListItem",
      } satisfies t.DescriptionListItem;
    },
    Document(blocks, _) {
      const astBlocks = readAST<t.Block[]>(blocks, "array").filter((it) => {
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
      } satisfies t.Document;
    }, // ("," (~">>" any)*)
    DocumentAttribute(_open, _leading, key, _trailing, _close, valueNode, _nl) {
      // ":" document_attribute_key ":" DocumentAttributeValue
      const value = readAST<any>(valueNode, "semantic");
      return {
        value,
        name: key.sourceString.trim(),
        type: "AttributeEntry",
      } satisfies t.AttributeEntry;
    },
    EndOfFile: (_nl, end) => end.sourceString,
    Fencable: defaultToAST,
    FenceDash: defaultToAST,
    FenceDot: defaultToAST,
    FenceEq: defaultToAST,
    FenceGeneric(delim1, _nl1, content, _nl2, _delim2) {
      const delimiter = delim1.sourceString;
      if (
        delimiter === "--" ||
        delimiter.length >= 4 && ["_", "=", "*"].includes(delimiter[0]!)
      ) {
        const matchResult = grammar.match(content.sourceString, "Document");
        if (!matchResult.succeeded()) {
          throw new Error(
            `Unable to parse ${delimiter} compound block content: ${matchResult.message}`,
          );
        }
        const document = (semantics(matchResult) as { toAST(): t.Document })
          .toAST();
        return {
          content: document.blocks,
          delimiter,
        };
      }
      return {
        content: readAST<any>(content, "semantic"),
        delimiter,
      };
    },
    FenceOpen: defaultToAST,
    FencePlus: defaultToAST,
    FenceSlash: defaultToAST,
    FenceStar: defaultToAST,
    FenceTable: defaultToAST,
    FenceUnder: defaultToAST,
    Footnote(_, id, __, text, ___) {
      return {
        id: id.sourceString || null,
        text: readAST<any>(text, "semantic"),
        type: "Footnote",
      } satisfies t.Footnote;
    },
    Header(marker, content, _maybeNewline) {
      return {
        content: readAST<any>(content, "semantic"),
        context: "section",
        level: marker.sourceString.length as 1 | 2 | 3 | 4 | 5 | 6,
        type: "Header",
      } satisfies t.BlockSection;
    },
    HeaderContent: defaultToAST,
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
      return readAST<any>(element, "semantic");
    },
    InlineElementOrText(content) {
      const ast = readAST<any>(content, "semantic");
      return ast;
      // return getCheckedAST<InlineElementOrPlainText>(content, "semantic");
    },
    InlineImage(_img, url, _open, alt, _comma, dims, _close) {
      return {
        ...readAST<Record<string, unknown>>(dims, "record"),
        alt: alt.sourceString,
        type: "InlineImage",
        url: url.sourceString,
      } satisfies t.InlineImage;
    },
    InlinePassthrough(_, content, __) {
      return {
        content: content.sourceString,
        type: "InlinePassthrough",
      } satisfies t.InlinePassthrough;
    },
    line(content, _nl) {
      return readAST<any>(content, "semantic");
    },
    Link(_, url, __, text, ___) {
      return {
        text: text.sourceString,
        type: "Link",
        url: url.sourceString,
      } satisfies t.Link;
    },
    ListContinuation(_, _newline, content) {
      return readAST<any>(content, "semantic");
    },
    ListItemContent(content, continuation, _dunno) {
      return [
        ...readAST<any[]>(content, "array"),
        ...(readAST<any[]>(continuation, "array") || []),
      ];
    },
    monospace_text(_, content, __) {
      return {
        content: readAST<any>(content, "semantic"),
        type: "MonospaceText",
      } satisfies t.MonospaceText;
    },
    newline(nl) {
      return {
        content: nl.sourceString,
        type: "PlainText",
      } satisfies t.PlainText;
    },
    nonemptyListOf(x, _sep, xs) {
      return [readAST<any>(x, "semantic")].concat(readAST<any[]>(xs, "array"));
    },
    NonFencable: defaultToAST,
    OrderedList(items) {
      return {
        content: normalizeDepth(
          readAST<(t.OrderedListItem & { marker: string })[]>(items, "array"),
        ),
        context: "olist",
        ordered: true,
        type: "BlockList",
      } satisfies t.BlockList;
    },
    OrderedListItem(marker, content, _nl) {
      /**
       * Decimal delimited ordered list items are a special case
       * and can only be depth 1.
       */
      const normalizedMarker = /^(?:\d+|[A-Za-z])\./.test(marker.sourceString)
        ? "."
        : marker.sourceString.trim();
      return {
        content: readAST<any>(content, "semantic"),
        depth: 0,
        marker: normalizedMarker,
        type: "OrderedListItem",
      } satisfies t.OrderedListItem & { marker: string };
    },
    ParagraphSegment(content, _bl, continuation) {
      // ParagraphSegment = InlineElementOrPlainText+ (BlankLine ParagraphSegment)?
      const children = [
        ...readAST<any[]>(content, "array"),
        ...(readAST<any[]>(continuation, "array") || []),
      ];
      return {
        content: children,
        type: "ParagraphSegment",
      } satisfies t.ParagraphSegment;
    },
    SingleLineText(content, _newline) {
      return {
        content: readAST<any>(content, "semantic"),
        type: "SingleLineText",
      } satisfies t.SingleLineText;
    },
    SubscriptText(_, content, __) {
      return {
        content: readAST<any>(content, "semantic"),
        type: "SubscriptText",
      } satisfies t.SubscriptText;
    },
    SuperscriptText(_, content, __) {
      return {
        content: readAST<any>(content, "semantic"),
        type: "SuperscriptText",
      } satisfies t.SuperscriptText;
    },
    TableCell(content) {
      return {
        content: readAST<any>(content, "semantic"),
        type: "TableCell",
      } satisfies t.TableCell;
    },
    TableRow(_marker, cells, _markers, _newline, _hmmwrong) {
      return {
        content: readAST<t.TableCell[]>(cells, "array"),
        type: "TableRow",
      } satisfies t.TableRow;
    },
    UnconstrainedBold(_, content, __) {
      return {
        content: readAST<any>(content, "semantic"),
        type: "UnconstrainedBold",
      } satisfies t.UnconstrainedBold;
    },
    UnconstrainedItalic(_, content, __) {
      return {
        content: readAST<any>(content, "semantic"),
        type: "UnconstrainedItalic",
      } satisfies t.UnconstrainedItalic;
    },
    UnorderedList(items) {
      return {
        content: normalizeDepth(
          readAST<(t.ListItem & { marker: string })[]>(items, "array"),
        ),
        context: "ulist",
        ordered: false,
        type: "BlockList",
      } satisfies t.BlockList;
    },
    UnorderedListItem(marker, content, _nl) {
      return {
        content: readAST<any>(content, "semantic"),
        depth: 0,
        marker: marker.sourceString.trim(),
        type: "ListItem",
      } satisfies t.ListItem & { marker: string };
    },
    UrlMacro(scheme, _colon, url, attributes) {
      return {
        attributes: readAST<any[]>(attributes, "array"),
        scheme: scheme.sourceString,
        type: "UrlMacro",
        url: `${scheme.sourceString}:${url.sourceString}`,
      } satisfies t.UrlMacro;
    },
  });
  return semantics;
};

export interface Parser {
  parse(input: string): Result<t.Document, MatchResult>;
  parse(input: string, startRule: string): Result<t.SemanticValue, MatchResult>;
  semantics: ReturnType<typeof grammar.createSemantics>;
  /** @deprecated Use `parse` instead. */
  toAST(input: string): Result<t.Document, MatchResult>;
  /** @deprecated Use `parse` instead. */
  toAST(input: string, startRule: string): Result<t.SemanticValue, MatchResult>;
}

export const createParser = (options: { guards?: ASTGuards } = {}): Parser => {
  const semantics = createSemantics(options.guards);
  const readAST = createASTReader(options.guards);
  function parse(input: string): Result<t.Document, MatchResult>;
  function parse(
    input: string,
    startRule: string,
  ): Result<t.SemanticValue, MatchResult>;
  function parse(
    input: string,
    startRule?: string,
  ): Result<t.SemanticValue, MatchResult> {
    const matchResult = grammar.match(input, startRule);
    if (matchResult.succeeded()) {
      const value = readAST<t.SemanticValue>(
        semantics(matchResult) as { toAST(): unknown },
        "semantic",
      );
      return { ok: true, value };
    }
    return { ok: false, value: matchResult };
  }
  return { parse, semantics, toAST: parse } as Parser;
};

const defaultParser = createParser();
export const semantics = defaultParser.semantics;
export const parse = defaultParser.parse;
/** @deprecated Use `parse` instead. */
export const toAST = parse;
