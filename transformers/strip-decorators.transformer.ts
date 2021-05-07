import ts from 'typescript';

interface PluginOptions {
  /**
   * Decorators names to strip
   */
  decorators: Array<string>;
  /**
   * Runs transformation only in filenames that contains these values (null for all files)
   */
  includeSources?: Array<string>;
}

export default function stripDecoratorsTransformerPlugin(
  program: ts.Program,
  opts: PluginOptions,
): unknown {
  return {
    before(ctx: ts.TransformationContext) {
      return (sourceFile: ts.SourceFile) => {
        function visitor(node: ts.Node): ts.Node {
          if (ts.isImportDeclaration(node)) {
            const namedImports = node.importClause?.namedBindings;
            if (ts.isNamedImports(namedImports)) {
              const hasHttpLoggerDEV = opts.decorators.some((decorator) =>
                namedImports.getText().includes(decorator),
              );
              if (hasHttpLoggerDEV && namedImports.elements.length === 1) {
                return undefined;
              }
              ctx.factory.updateNamedImports(
                namedImports,
                namedImports.elements.filter((element) =>
                  opts.decorators.some(
                    (decorator) => element.getText() !== decorator,
                  ),
                ),
              );
            }
          }
          if (ts.isDecorator(node)) {
            const decoratorName = node.expression.getChildAt(0).getText();
            if (
              opts.decorators.some((decorator) => decorator === decoratorName)
            ) {
              return undefined;
            }
          }
          return ts.visitEachChild(node, visitor, ctx);
        }

        if (opts.includeSources) {
          if (
            !opts.includeSources.some((source) =>
              sourceFile.fileName.includes(source),
            )
          ) {
            return sourceFile;
          }
        }
        return ts.visitEachChild(sourceFile, visitor, ctx);
      };
    },
  };
}
