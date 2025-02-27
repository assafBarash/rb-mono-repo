import fs from 'fs/promises';
import path from 'path';
import { Project } from 'ts-morph';

export type IndexItConfiguration = {
  alias?: string;
  paths: string[];
};

export const IndexIt = async ({ paths }: IndexItConfiguration) => {
  const morph = new Project({
    tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json')
  });

  await Promise.all(
    paths.map(async (pathStr) => {
      const dir = await fs.readdir(path.join(process.cwd(), pathStr));
      dir
        .filter((file) => file.endsWith('.ts'))
        .forEach((file) => {
          const filePath = path.join(pathStr, file);
          const fileAst = morph.getSourceFile(filePath);
          const exports = fileAst?.getExportedDeclarations();
          console.log('## fileAst', filePath, exports);
        });

      console.log('## dir', dir);
    })
  );
};
