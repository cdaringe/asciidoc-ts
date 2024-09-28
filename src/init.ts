import { grammar } from "./grammar.js";
import { semantics } from "./ast.js";
export const verifyRules = () => {
  const ruleAliasRegex = /--\s+[_a-zA-Z0-9]+$/;
  const grammarRules = new Set(
    Object.entries(grammar.rules).filter(([_, it]) =>
      !it.source.contents.match(ruleAliasRegex)
    )
      .map(([key, _]) => key),
  );
  const actionRules = new Set(
    Object.keys((semantics as any)._getActionDict("toAST")),
  );
  const missingRules = [
    ...new Set([...grammarRules].filter((x) => {
      const isUpper = x[0] !== x[0]?.toLocaleLowerCase();
      return isUpper && !actionRules.has(x);
    })),
  ].sort();
  if (missingRules.length) {
    const missingTexts = missingRules.map((it) => {
      return `${it} // ${grammar.rules[it]?.body}`;
    });
    throw new Error(`Missing rules:\n\n${[...missingTexts].join("\n")}\n`);
  }
};
