import type * as t from "./ast-types.js";

type Node = Record<string, any> & { type?: string };
type TypedNode =
  | t.ParsingNode
  | t.BlockAnchor
  | t.BlockImage
  | t.BlockQuotedParagraph
  | t.DescriptionListItem
  | t.ListItem
  | t.OrderedListItem
  | t.ParagraphSegment
  | t.SingleLineText
  | t.TableCell
  | t.TableRow
  | t.UrlMacro;

const assertNever = (value: never): never => {
  throw new TypeError(
    `Cannot print semantic value of type ${(value as { type: string }).type}`,
  );
};

const punctuation = /^[,.;:!?)}\]]/;
const openingPunctuation = /[(\[{]$/;

const printSequence = (values: unknown[]): string =>
  values.reduce<string>((output, value, index) => {
    const next = printValue(value);
    if (!output || !next) return output + next;

    const previous = values[index - 1] as Node | string | undefined;
    const current = value as Node | string;
    if (
      typeof previous === "object" && previous?.type === "PlainText" &&
      typeof current === "object" && current?.type === "PlainText"
    ) return `${output}\n${next}`;
    if (next.startsWith("\n") || output.endsWith("\n")) return output + next;
    if (punctuation.test(next) || openingPunctuation.test(output)) {
      return output + next;
    }
    return `${output} ${next}`;
  }, "");

const printAttributes = (attributes: unknown[] = []): string =>
  attributes.map((attribute) => printValue(attribute)).join(",");

const printMetadata = (node: Node): string => {
  const metadata = node.metadata as Node | undefined;
  const anchor = node.anchor as Node | undefined;
  const lines: string[] = [];
  if (anchor) lines.push(printValue(anchor));
  if (metadata?.title && !Array.isArray(metadata.title)) {
    lines.push(`.${printValue(metadata.title)}`);
  }
  if (metadata?.attributes?.length) {
    lines.push(`[${printAttributes(metadata.attributes)}]`);
  }
  return lines.length ? `${lines.join("\n")}\n` : "";
};

const printDelimited = (node: Node, fallback: string): string => {
  const delimiter = node.delimiter ?? fallback;
  const content = Array.isArray(node.content) &&
      node.content.some((value: unknown) => typeof value === "object" && value !== null && "context" in value)
    ? node.content.map((value: unknown) => printValue(value)).join("\n\n")
    : node.type === "BlockComment" && Array.isArray(node.content)
    ? printSequence(node.content)
    : Array.isArray(node.content)
    ? node.content.reduce<string>((output: string, value: unknown) => {
      const next = printValue(value);
      if (!output || output.endsWith("\n") || next.startsWith("\n")) {
        return output + next;
      }
      // Braces are split from the preceding text by the inline grammar even in
      // verbatim blocks. Restore their source-line relationship here.
      if (/^[{[]/.test(next)) return `${output} ${next}`;
      return `${output}\n${next}`;
    }, "")
    : printValue(node.content);
  return `${printMetadata(node)}${delimiter}\n${content}\n${delimiter}`;
};

const printValue = (value: unknown): string => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return printSequence(value);

  const intermediate = value as Node;
  if (typeof intermediate.type !== "string") {
    return Object.values(intermediate).map((entry) => printValue(entry)).join("");
  }

  const node = intermediate as TypedNode;
  switch (node.type) {
    case "Document":
      return `${node.blocks.map((block: unknown) => printValue(block)).join("\n\n")}\n`;
    case "Terminal":
    case "PlainText":
      return node.content;
    case "SingleLineText":
    case "ParagraphSegment":
      return printSequence(node.content);
    case "Header":
      return `${printMetadata(node)}${"=".repeat(node.level)} ${printSequence((node as unknown as Node).content)}`;
    case "HeaderSetext": {
      const content = printValue(node.content);
      return `${printMetadata(node)}${content}\n${(node.level === 1 ? "=" : "-").repeat(Math.max(1, content.length))}`;
    }
    case "BlockParagraph":
    case "BlockAbstract":
    case "BlockPartintro":
      return `${printMetadata(node)}${printSequence(node.content)}`;
    case "BlankLine":
      return printSequence(node.content);
    case "ConstrainedBold":
      return `*${printSequence(node.content)}*`;
    case "UnconstrainedBold":
      return `**${printSequence(node.content)}**`;
    case "ConstrainedItalic":
      return `_${printValue(node.content)}_`;
    case "UnconstrainedItalic":
      return `_${printSequence(node.content)}_`;
    case "MonospaceText":
      return `\`${printValue(node.content)}\``;
    case "SubscriptText":
      return `~${printValue(node.content)}~`;
    case "SuperscriptText":
      return `^${printValue(node.content)}^`;
    case "InlinePassthrough":
      return `+++${node.content}+++`;
    case "AttributeReference":
      return `{${node.name}}`;
    case "CrossReference":
      return `<<${node.id}${node.text?.length ? `,${printValue(node.text)}` : ""}>>`;
    case "Footnote":
      return `footnote:${node.id ?? ""}[${printValue(node.text)}]`;
    case "Link":
      return `link:${node.url}[${node.text}]`;
    case "UrlMacro":
      return `${node.url}[${printAttributes(node.attributes)}]`;
    case "InlineImage":
    case "BlockImage": {
      const dimensions = node.width || node.height ? `,${node.width ?? ""},${node.height ?? ""}` : "";
      return `${node.type === "BlockImage" ? "image::" : "image:"}${node.url}[${node.alt}${dimensions}]`;
    }
    case "BlockAnchor":
      return `[[${node.id}${node.reftext ? `,${node.reftext}` : ""}]]`;
    case "AttributeEntry":
      return node.value === undefined ? node.name : `${node.name}=${printValue(node.value)}`;
    case "AttributePositional":
    case "AttributeStyle":
    case "AttributeId":
    case "AttributeRole":
    case "AttributeOption":
    case "AttributeAuthor":
    case "AttributeCitation":
    case "AttributeLanguage":
      return node.name;
    case "BlockList":
      return node.content.map((item: Node) =>
        `${node.ordered ? ".".repeat(item.depth + 1) : "*".repeat(item.depth + 1)} ${printSequence(item.content)}`
      ).join("\n");
    case "ListItem":
    case "OrderedListItem":
      return printSequence(node.content);
    case "DescriptionList":
      return node.content.map((item: unknown) => printValue(item)).join("\n");
    case "DescriptionListItem":
      return `${node.term}:: ${printSequence(node.description)}`;
    case "BlockAdmonition":
      if (node.delimiter) return printDelimited(node, "====");
      return `${printMetadata(node)}${node.admonitionType}: ${printValue(node.content)}`;
    case "BlockQuotedParagraph":
      return `"${printSequence(node.content)}"\n-- ${node.citation}`;
    case "BlockListing":
    case "BlockSource":
      return printDelimited(node, "----");
    case "BlockComment":
      return printDelimited(node, "////");
    case "BlockExample":
      return printDelimited(node, "====");
    case "BlockQuote":
      return printDelimited(node, "____");
    case "BlockSidebar":
      return printDelimited(node, "****");
    case "BlockOpen":
      return printDelimited(node, "--");
    case "BlockLiteral":
      return printDelimited(node, "....");
    case "BlockPassthrough":
      return printDelimited(node, "++++");
    case "BlockVerse":
      return printDelimited(node, "____");
    case "BlockMacro":
      return `${printMetadata(node)}${node.name}::${node.target ?? ""}[${node.attributes ?? ""}]\n${node.content}`;
    case "HorizontalRule":
      return "'''";
    case "BlockTable":
      return printDelimited(node, "|===");
    case "TableRow":
      return node.content.map((cell: unknown) => `|${printValue(cell)}`).join("");
    case "TableCell":
      return printSequence(node.content);
    default:
      return assertNever(node);
  }
};

/** Serialize an AST semantic value to canonical AsciiDoc. */
export const print = (value: t.SemanticValue): string => printValue(value);
