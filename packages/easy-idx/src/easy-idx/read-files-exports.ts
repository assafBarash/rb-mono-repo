import { Project, SyntaxKind } from 'ts-morph';
import { FileExportData } from './types';
import path from 'path';
import { GENERATE_SIGNATURE } from './constants';

type Params = {
  dir: string[];
  morph: Project;
  exportFile?: string;
};

export const readFilesExports = ({ dir, exportFile, ...config }: Params) =>
  Object.values(
    dir
      .map((file) =>
        file.endsWith('.ts') ? file : path.join(file, `index.ts`)
      )
      .flatMap(readFileExports(config))
      .reduce(aggregateExports, {})
  ).reduce(aggregateByIndexFiles(exportFile), {});

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

const aggregateByIndexFiles =
  (exportFile?: string) =>
  (
    acc: Record<string, FileExportData[]>,
    { file, ...fileExportData }: FileExportData
  ) => {
    const fileDir = parseDirname({ file, exportFile });
    const name = parseName({ file, exportFile });

    return {
      ...acc,
      [fileDir]: [{ file: name, ...fileExportData }, ...(acc[fileDir] || [])]
    };
  };

type ParseDirParams = {
  file: string;
  exportFile?: string;
};

const parseName = ({ file, exportFile }: ParseDirParams) => {
  const name =
    file.endsWith('index.ts') || file.endsWith(`${exportFile}.ts`)
      ? path.basename(`${path.dirname(file)}.ts`)
      : path.basename(file);

  return exportFile ? `${exportFile}/${name}` : name;
};

const parseDirname = ({ file, exportFile }: ParseDirParams) => {
  const dirname = file.endsWith('index.ts')
    ? path.dirname(`${path.dirname(file)}.ts`)
    : path.dirname(file);

  return exportFile ? path.dirname(dirname) : dirname;
};
