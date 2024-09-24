import * as ts from "typescript";
import * as fs from "fs";
import { globSync } from "glob";

const log = (msg: string) => console.log(`[ts-sorter] ${msg}`);

const sortTransformer =
  (context: ts.TransformationContext) => (rootNode: ts.Node) => {
    function visit(node: ts.Node): ts.Node {
      if (ts.isObjectLiteralExpression(node)) {
        const properties = [...node.properties].sort((a, b) => {
          const aName = ts.isPropertyAssignment(a) || ts.isMethodDeclaration(a)
            ? a.name.getText()
            : "";
          const bName = ts.isPropertyAssignment(b) || ts.isMethodDeclaration(b)
            ? b.name.getText()
            : "";
          return aName.localeCompare(bName);
        });

        const nextNode = ts.factory.updateObjectLiteralExpression(
          node,
          properties,
        );
        return ts.visitEachChild(nextNode, visit, context);
      }
      return ts.visitEachChild(node, visit, context);
    }
    return ts.visitNode(rootNode, visit);
  };

function sortObjectMethods(sourceFile: ts.SourceFile): ts.SourceFile {
  const result = ts.transform(sourceFile, [sortTransformer]);
  return result.transformed[0] as ts.SourceFile;
}

function processFile(filePath: string) {
  const sourceText = fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  );

  const sortedSourceFile = sortObjectMethods(sourceFile);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const result = printer.printNode(
    ts.EmitHint.SourceFile,
    sortedSourceFile,
    sourceFile,
  );

  fs.writeFileSync(filePath, result);
  log(`processed: ${filePath}`);
}

globSync("./src/*.ts")
  /**
   * @warn DEBUG ONLY
   */
  // .filter((it) => it.match(/foo/))
  .forEach(processFile);
