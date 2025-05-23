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
  exportFile?: string;
  customName?: string;
};

export const createIndexFile = async ({
  morph,
  indexDir,
  filesExports,
  customName = 'index',
  ...config
}: Params) => {
  const indexFilePath = path.join(indexDir, `${customName}.ts`);
  const existingIndex = await fs
    .readFile(indexFilePath, 'utf-8')
    .catch(() => '');

  if (existingIndex && !existingIndex.includes(GENERATE_SIGNATURE))
    throw new Error(`existing_index::${indexFilePath}`);

  const indexFile = morph.createSourceFile(indexFilePath, '', {
    overwrite: true
  });

  indexFile.insertText(0, `${GENERATE_SIGNATURE}\n\n`);

  filesExports
    .sort((a, b) => a.file.localeCompare(b.file))
    .forEach(handleFileExports({ indexFile, ...config }));

  await indexFile.save();
};

type HandleFileExportsConfig = Omit<
  Params,
  'morph' | 'filesExports' | 'indexDir'
> & {
  indexFile: SourceFile;
};
export const handleFileExports =
  ({ indexFile, alias, noTypes, exportFile }: HandleFileExportsConfig) =>
  ({ file, variableExports, typeExports }: FileExportData) => {
    const buildExportDeclarationParams = createBuildExportDeclarationParams({
      file,
      exportFile,
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
  config: IAlias & { file: string; exportFile?: string };
  params: {
    exports: string[];
    isTypeOnly?: boolean;
  };
};
const createBuildExportDeclarationParams =
  ({ file, alias, exportFile }: DeclarationBuilder['config']) =>
  ({ exports, isTypeOnly }: DeclarationBuilder['params']) => {
    const name = path.basename(file).replace('.ts', '');

    return {
      moduleSpecifier: `./${name}${exportFile ? `/${exportFile}` : ''}`,
      ...(alias
        ? { namespaceExport: parseByAlias({ alias, name }) }
        : { namedExports: exports.sort().map((name) => ({ name })) }),
      isTypeOnly
    };
  };
