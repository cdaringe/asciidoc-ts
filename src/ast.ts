import { grammar } from "./grammar.js";
import { Result } from "./result.js";
import * as t from "./ast-types.js";
import { truthyValuesOrEmptyPojo } from "./collection.js";
import { toDerivedBlockType } from "./block.js";
import { normalizeDepth } from "./list.js";
import { MatchResult } from "ohm-js";
function defaultToAST(it: any) {
  return it.toAST();
}
export const semantics = grammar.createSemantics();
semantics.addOperation<any>("toAST", {
  _iter(...children) {
    const next = children.map((child) => child.toAST());
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
    return text.toAST();
  },
  Attribute: defaultToAST,
  AttributeEntry(_, name, __, value, _newline) {
    return {
      ...truthyValuesOrEmptyPojo({ value: value.toAST() }),
      name: name.sourceString,
      type: "AttributeEntry",
    } satisfies t.AttributeEntry;
  },
  AttributeList: (_open, attrs, _close) => attrs.toAST(),
  AttributeNamed(key, _eq, value) {
    return {
      ...truthyValuesOrEmptyPojo({ value: value.toAST() }),
      name: key.sourceString,
      type: "AttributeEntry",
    } satisfies t.AttributeEntry;
  },
  AttributePositional(content) {
    return {
      name: content.sourceString,
      type: "AttributeEntry",
    } satisfies t.AttributeEntry;
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
      content: [...spaces.toAST(), newline.toAST()],
      context: "blank_line",
      type: "BlankLine",
    } satisfies t.BlankLine;
  },
  Block(blockStructureNode) {
    // const blockStructureAst = getCheckedAST<BlockStructure>(blockStructureNode, "BlockStructure");
    const blockStructureAst = blockStructureNode.toAST() as t.BlockStructure;
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
      content: content.toAST(),
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
    const hd = firstNode.toAST();
    const tail = recursiveNode.toAST() || [];
    return [...(Array.isArray(hd) ? hd : [hd]), ...tail.flat()];
  },
  BlockContentGenericLineEmpty: defaultToAST,
  BlockContentGenericLineFull(_nl, contentN) {
    // BlockContentGenericFull<delim> = blank_lines? (~delim InlineElementOrText<delim>)+ BlockContentGeneric<delim>?
    const tail = contentN.toAST() ?? [];
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
    const title = titleNode.toAST();
    return {
      ...truthyValuesOrEmptyPojo({ title }),
      attributes: attributes.toAST(),
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
      content: flattenParagraphSegments(content.toAST() as t.ParagraphSegment),
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
      content: content.toAST(),
      context: "quote",
      type: "BlockQuotedParagraph",
    } satisfies t.BlockQuotedParagraph;
  },
  BlockSectionSetext(text, underline, _) {
    return {
      content: text.toAST(),
      context: "section",
      level: underline.sourceString[0] === "=" ? 1 : 2,
      type: "HeaderSetext",
    } satisfies t.BlockSectionSetext;
  },
  BlockStructure(anchor, metadata, blockKind, _nl1, _nl2) {
    const [metadataAst] = metadata.toAST() ?? [];
    const [anchorAst] = anchor.toAST() ?? [];
    const blockKindAST = blockKind.toAST();
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
      content: rows.toAST(),
      context: "table",
      type: "BlockTable",
    } satisfies t.BlockTable;
  },
  ConstrainedBold(_, content, __) {
    return {
      content: content.toAST(),
      type: "ConstrainedBold",
    } satisfies t.ConstrainedBold;
  },
  ConstrainedItalic(_, content, __) {
    return {
      content: content.toAST(),
      type: "ConstrainedItalic",
    } satisfies t.ConstrainedItalic;
  },
  CrossReference(_, id, text, __) {
    return {
      ...truthyValuesOrEmptyPojo({ text: text.toAST() }),
      id: id.sourceString,
      type: "CrossReference",
    } satisfies t.CrossReference;
  },
  CrossReferenceId: defaultToAST, // (~"," ~">>" any)+
  CrossReferenceText: (_comma, text) => {
    return text.toAST();
  },
  DescriptionList(items) {
    return {
      content: items.toAST(),
      context: "dlist",
      type: "DescriptionList",
    } satisfies t.BlockDescriptionList;
  },
  DescriptionListItem(term, _, content) {
    return {
      description: content.toAST(),
      term: term.sourceString.trim(),
      type: "DescriptionListItem",
    } satisfies t.DescriptionListItem;
  },
  Document(blocks, _) {
    const astBlocks = (blocks.toAST() as t.Block[]).filter((it) => {
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
  DocumentAttribute(_open, key, _close, valueNode, _nl) {
    // ":" document_attribute_key ":" DocumentAttributeValue
    const value = valueNode.toAST();
    return {
      value,
      name: key.sourceString,
      type: "AttributeEntry",
    } satisfies t.AttributeEntry;
  },
  EndOfFile: (_nl, end) => end.sourceString,
  Fencable: defaultToAST,
  FenceDash: defaultToAST,
  FenceDot: defaultToAST,
  FenceEq: defaultToAST,
  FenceGeneric(delim1, _nl1, content, _nl2, _delim2) {
    return {
      content: content.toAST(),
      delimiter: delim1.sourceString,
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
      text: text.toAST(),
      type: "Footnote",
    } satisfies t.Footnote;
  },
  Header(marker, content, _maybeNewline) {
    return {
      content: content.toAST(),
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
    return element.toAST();
  },
  InlineElementOrText(content) {
    const ast = content.toAST();
    return ast;
    // return getCheckedAST<InlineElementOrPlainText>(content, "any");
  },
  InlineImage(_img, url, _open, alt, _comma, dims, _close) {
    return {
      ...dims.toAST(),
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
    return content.toAST();
  },
  Link(_, url, __, text, ___) {
    return {
      text: text.sourceString,
      type: "Link",
      url: url.sourceString,
    } satisfies t.Link;
  },
  ListContinuation(_, _newline, content) {
    return content.toAST();
  },
  ListItemContent(content, continuation, _dunno) {
    return [...content.toAST(), ...(continuation.toAST() || [])];
  },
  monospace_text(_, content, __) {
    return {
      content: content.toAST(),
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
    return [x.toAST()].concat(xs.toAST());
  },
  NonFencable: defaultToAST,
  OrderedList(items) {
    return {
      content: normalizeDepth(items.toAST() as t.ListItem[]),
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
    const deciDelimited = marker.sourceString.match(/(\d+)\./)?.[1];
    const depth = deciDelimited ? 1 : marker.sourceString.length;
    return {
      depth,
      content: content.toAST(),
      type: "OrderedListItem",
    } satisfies t.OrderedListItem;
  },
  ParagraphSegment(content, _bl, continuation) {
    // ParagraphSegment = InlineElementOrPlainText+ (BlankLine ParagraphSegment)?
    const children = [...content.toAST(), ...(continuation.toAST() || [])];
    return {
      content: children,
      type: "ParagraphSegment",
    } satisfies t.ParagraphSegment;
  },
  SingleLineText(content, _newline) {
    return {
      content: content.toAST(),
      type: "SingleLineText",
    } satisfies t.SingleLineText;
  },
  SubscriptText(_, content, __) {
    return {
      content: content.toAST(),
      type: "SubscriptText",
    } satisfies t.SubscriptText;
  },
  SuperscriptText(_, content, __) {
    return {
      content: content.toAST(),
      type: "SuperscriptText",
    } satisfies t.SuperscriptText;
  },
  TableCell(content) {
    return {
      content: content.toAST(),
      type: "TableCell",
    } satisfies t.TableCell;
  },
  TableRow(_marker, cells, _markers, _newline, _hmmwrong) {
    return {
      content: cells.toAST(),
      type: "TableRow",
    } satisfies t.TableRow;
  },
  UnconstrainedBold(_, content, __) {
    return {
      content: content.toAST(),
      type: "UnconstrainedBold",
    } satisfies t.UnconstrainedBold;
  },
  UnconstrainedItalic(_, content, __) {
    return {
      content: content.toAST(),
      type: "UnconstrainedItalic",
    } satisfies t.UnconstrainedItalic;
  },
  UnorderedList(items) {
    return {
      content: normalizeDepth(items.toAST() as t.ListItem[]),
      context: "ulist",
      ordered: false,
      type: "BlockList",
    } satisfies t.BlockList;
  },
  UnorderedListItem(marker, content, _nl) {
    return {
      content: content.toAST(),
      depth: marker.sourceString.length,
      type: "ListItem",
    } satisfies t.ListItem;
  },
  UrlMacro(scheme, _colon, url, attributes) {
    return {
      attributes: attributes.toAST(),
      scheme: scheme.sourceString,
      type: "UrlMacro",
      url: `${scheme.sourceString}:${url.sourceString}`,
    } satisfies t.UrlMacro;
  },
});
export const toAST = (
  input: string,
  startRule?: string,
): Result<t.ASTNode, MatchResult> => {
  const matchResult = grammar.match(input, startRule);
  if (matchResult.succeeded()) {
    return { ok: true, value: semantics(matchResult).toAST() };
  } else {
    return { ok: false, value: matchResult };
  }
};
