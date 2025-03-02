import path from 'path';
import fs from 'fs/promises';
import { Project, SourceFile } from 'ts-morph';
import { FileExportData, IAlias } from './types';
import mcgill from 'mcgill';
import { GENERATE_SIGNATURE } from './constants';

type Params = IAlias & {
  morph: Project;
  filesExports: FileExportData[];
  noTypes?: boolean;
  indexDir: string;
};

export const createIndexFile = async ({
  morph,
  indexDir,
  filesExports,
  ...config
}: Params) => {
  const indexFilePath = path.join(indexDir, 'index.ts');
  const existingIndex = await fs
    .readFile(indexFilePath, 'utf-8')
    .catch(() => '');

  if (existingIndex && !existingIndex.includes(GENERATE_SIGNATURE))
    throw new Error(`existing_index::${indexFilePath}`);

  const indexFile = morph.createSourceFile(indexFilePath, '', {
    overwrite: true
  });

  indexFile.insertText(0, `${GENERATE_SIGNATURE}\n\n`);

  filesExports.forEach(handleFileExports({ indexFile, ...config }));

  await indexFile.save();
};

type HandleFileExportsConfig = IAlias & {
  indexFile: SourceFile;
  noTypes?: boolean;
};
export const handleFileExports =
  ({ indexFile, alias, noTypes }: HandleFileExportsConfig) =>
  ({ file, variableExports, typeExports }: FileExportData) => {
    const buildExportDeclarationParams = createBuildExportDeclarationParams({
      file,
      alias
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
  config: IAlias & { file: string };
  params: {
    exports: string[];
    isTypeOnly?: boolean;
  };
};
const createBuildExportDeclarationParams =
  ({ file, alias }: DeclarationBuilder['config']) =>
  ({ exports, isTypeOnly }: DeclarationBuilder['params']) => {
    const name = path.basename(file).replace('.ts', '');

    return {
      moduleSpecifier: `./${name}`,
      ...(alias
        ? { namespaceExport: parseByAlias({ alias, name }) }
        : { namedExports: exports.sort().map((name) => ({ name })) }),
      isTypeOnly
    };
  };
