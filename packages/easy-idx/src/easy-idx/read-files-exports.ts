import { Project, SyntaxKind } from 'ts-morph';
import { FileExportData } from './types';
import path from 'path';
import { GENERATE_SIGNATURE } from './constants';

type Params = {
  dir: string[];
  morph: Project;
  exportFile?: string;
};

export const readFilesExports = ({
  dir,
  exportFile = 'index',
  ...config
}: Params) =>
  Object.values(
    dir
      .map((file) => {
        console.log('## GG', { file, exportFile });

        return file.endsWith('.ts')
          ? file
          : path.join(file, `${exportFile}.ts`);
      })
      .flatMap(readFileExports(config))
      .reduce(aggregateExports, {})
  ).reduce(aggregateByIndexFiles, {});

const tsKinds = [
  SyntaxKind.TypeAliasDeclaration,
  SyntaxKind.InterfaceDeclaration
];

type ReactExportsConfig = {
  morph: Project;
};
type RawExportData = {
  label: string;
  kind: 'type' | 'variable';
  file: string;
};
const readFileExports =
  ({ morph }: ReactExportsConfig) =>
  (file: string): RawExportData[] => {
    const fileAst = morph.addSourceFileAtPath(file);

    if (fileAst.getFullText().includes(GENERATE_SIGNATURE)) return [];

    const exports = fileAst.getExportedDeclarations();

    return Array.from(exports.entries()).flatMap(([label, declarations]) =>
      declarations.flatMap((decl) => {
        const kind = tsKinds.includes(decl.getKind()) ? 'type' : 'variable';
        return { label, kind, file };
      })
    );
  };

const aggregateExports = (
  acc: Record<string, FileExportData>,
  { file, label, kind }: RawExportData
) => {
  const data = acc[file] || {
    file,
    typeExports: [],
    variableExports: []
  };

  if (kind === 'type') data.typeExports.push(label);
  else data.variableExports.push(label);

  return {
    ...acc,
    [file]: data
  };
};

const aggregateByIndexFiles = (
  acc: Record<string, FileExportData[]>,
  { file, ...fileExportData }: FileExportData
) => {
  const fileDir = parseDirname(file);
  const name = parseName(file);

  return {
    ...acc,
    [fileDir]: [{ file: name, ...fileExportData }, ...(acc[fileDir] || [])]
  };
};

const parseName = (file: string) =>
  file.endsWith('index.ts')
    ? path.basename(`${path.dirname(file)}.ts`)
    : path.basename(file);

const parseDirname = (file: string) =>
  file.endsWith('index.ts')
    ? path.dirname(`${path.dirname(file)}.ts`)
    : path.dirname(file);
