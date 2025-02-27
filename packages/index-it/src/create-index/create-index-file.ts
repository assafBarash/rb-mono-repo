import path from 'path';
import { Project, SourceFile } from 'ts-morph';
import { FileExportData, IAlias } from './types';
import mcgill from 'mcgill';

type Params = IAlias & {
  morph: Project;
  pathStr: string;
  filesExports: FileExportData[];
};

export const createIndexFile = async ({
  morph,
  pathStr,
  filesExports,
  alias
}: Params) => {
  const indexFilePath = path.join(pathStr, 'index.ts');
  const indexFile = morph.createSourceFile(indexFilePath, '', {
    overwrite: true
  });

  filesExports.forEach(handleFileExports({ indexFile, alias }));

  await indexFile.save();
};

type HandleFileExportsConfig = IAlias & {
  indexFile: SourceFile;
};
export const handleFileExports =
  ({ indexFile, alias }: HandleFileExportsConfig) =>
  ({ file, variableExports, typeExports }: FileExportData) => {
    const buildExportDeclarationParams = createBuildExportDeclarationParams({
      file,
      alias
    });
    indexFile.addExportDeclaration(
      buildExportDeclarationParams({ exports: variableExports })
    );

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
  config: IAlias & { file: string };
  params: {
    exports: string[];
    isTypeOnly?: boolean;
  };
};
const createBuildExportDeclarationParams =
  ({ file, alias }: DeclarationBuilder['config']) =>
  ({ exports, isTypeOnly }: DeclarationBuilder['params']) => {
    const name = file.replace('.ts', '');
    return {
      moduleSpecifier: `./${name}`,
      namedExports: exports.map((name) => ({ name })),
      namespaceExport: parseByAlias({ alias, name }),
      isTypeOnly
    };
  };
