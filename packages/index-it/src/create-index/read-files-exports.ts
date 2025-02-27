import path from 'path';
import { Project, SyntaxKind } from 'ts-morph';
import { FileExportData } from './types';

type Params = {
  dir: string[];
  morph: Project;
  pathStr: string;
};

export const readFilesExports = ({ dir, ...config }: Params) =>
  Object.values(
    dir
      .filter((file) => file.endsWith('.ts') && file !== 'index.ts') // Ignore index.ts
      .flatMap(readFileExports(config))
      .reduce(aggregateExports, {})
  );

const tsKinds = [
  SyntaxKind.TypeAliasDeclaration,
  SyntaxKind.InterfaceDeclaration
];

type ReactExportsConfig = {
  morph: Project;
  pathStr: string;
};
type RawExportData = {
  label: string;
  kind: 'type' | 'variable';
  file: string;
};
const readFileExports =
  ({ morph, pathStr }: ReactExportsConfig) =>
  (file: string): RawExportData[] => {
    const filePath = path.join(pathStr, file);
    const fileAst = morph.addSourceFileAtPath(filePath);
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
