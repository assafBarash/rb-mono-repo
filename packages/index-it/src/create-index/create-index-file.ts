import path from 'path';
import { Project, SourceFile } from 'ts-morph';
import { FileExportData, IAlias } from './types';
import mcgill from 'mcgill';

type Params = IAlias & {
  morph: Project;
  pathStr: string;
  filesExports: FileExportData[];
  noTypes?: boolean;
};

export const createIndexFile = async ({
  morph,
  pathStr,
  filesExports,
  ...config
}: Params) => {
  const indexFilePath = path.join(pathStr, 'index.ts');
  const indexFile = morph.createSourceFile(indexFilePath, '', {
    overwrite: true
  });

  filesExports.forEach(handleFileExports({ indexFile, pathStr, ...config }));

  await indexFile.save();
};

type HandleFileExportsConfig = IAlias & {
  indexFile: SourceFile;
  noTypes?: boolean;
  pathStr: string;
};
export const handleFileExports =
  ({ indexFile, alias, noTypes, pathStr }: HandleFileExportsConfig) =>
  ({ file, variableExports, typeExports }: FileExportData) => {
    const buildExportDeclarationParams = createBuildExportDeclarationParams({
      file,
      alias,
      pathStr
    });
    if (variableExports.length)
      indexFile.addExportDeclaration(
        buildExportDeclarationParams({ exports: variableExports })
      );

    if (typeExports.length && !noTypes && !alias)
      indexFile.addExportDeclaration(
        buildExportDeclarationParams({ exports: typeExports, isTypeOnly: true })
      );
  };

type ParseByAliasParams = IAlias & {
  name: string;
};
const parseByAlias = ({ alias, name }: ParseByAliasParams) =>
  alias ? mcgill(name).to[alias]() : undefined;

type DeclarationBuilder = {
  config: IAlias & { file: string; pathStr: string };
  params: {
    exports: string[];
    isTypeOnly?: boolean;
  };
};
const createBuildExportDeclarationParams =
  ({ file, alias, pathStr }: DeclarationBuilder['config']) =>
  ({ exports, isTypeOnly }: DeclarationBuilder['params']) => {
    const name = file
      .replace('.ts', '')
      .replace(pathStr, '::::')
      .split('::::')
      .pop();

    console.log('## DEBUG', { name, file, pathStr });

    return {
      moduleSpecifier: `./${name}`,
      ...(alias
        ? { namespaceExport: parseByAlias({ alias, name }) }
        : { namedExports: exports.map((name) => ({ name })) }),
      isTypeOnly
    };
  };
