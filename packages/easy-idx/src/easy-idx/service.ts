import fg from 'fast-glob';
import path from 'path';
import { Project, QuoteKind } from 'ts-morph';
import { readFilesExports } from './read-files-exports';
import { DirHandlerConfig, IndexItConfiguration } from './types';
import { createIndexFile } from './create-index-file';

export const EasyIdx = async ({ paths, ...config }: IndexItConfiguration) => {
  const morph = new Project({
    tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json')
  });

  morph.manipulationSettings.set({ quoteKind: QuoteKind.Single });

  await Promise.all(paths.map(createDirHandler({ morph, ...config })));
};

const createDirHandler =
  (config: DirHandlerConfig) => async (pathStr: string) => {
    const dir = await readDir(pathStr);

    const filesExports = readFilesExports({
      ...config,
      dir
    });

    await Promise.all(
      Object.entries(filesExports).map(([indexDir, filesExports]) =>
        createIndexFile({ indexDir, filesExports, ...config })
      )
    );
  };

const readDir = async (pathStr: string) =>
  (
    await Promise.all([
      fg(path.join(process.cwd(), pathStr), {}),
      pathStr.endsWith('*.ts')
        ? fg(path.join(process.cwd(), pathStr.replace('*.ts', '*/index.ts')))
        : []
    ])
  ).flat();
