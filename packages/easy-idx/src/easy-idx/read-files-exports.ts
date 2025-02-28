import { Project, SyntaxKind } from 'ts-morph';
import { FileExportData } from './types';
import path from 'path';
import { GENERATE_SIGNATURE } from '../constants';

type Params = {
  dir: string[];
  morph: Project;
};

export const readFilesExports = ({ dir, ...config }: Params) =>
  Object.values(
    dir
      .filter((file) => file.endsWith('.ts') && file !== 'index.ts') // Ignore index.ts
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
    const filePath = file;
    const fileAst = morph.addSourceFileAtPath(filePath);

    console.log('## fileAst', { fileAst: fileAst.getText() });

    if (fileAst.getText().includes(GENERATE_SIGNATURE)) return [];

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
  const fileDir = path.dirname(file);
  const name = path.basename(file);

  return {
    ...acc,
    [fileDir]: [{ file: name, ...fileExportData }, ...(acc[fileDir] || [])]
  };
};
