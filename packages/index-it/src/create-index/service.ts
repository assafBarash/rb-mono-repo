import fg from 'fast-glob';
import path from 'path';
import { Project, QuoteKind } from 'ts-morph';
import { readFilesExports } from './read-files-exports';
import { IndexItConfiguration } from './types';
import { createIndexFile } from './create-index-file';

export const IndexIt = async ({ paths, ...config }: IndexItConfiguration) => {
  const morph = new Project({
    tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json')
  });

  morph.manipulationSettings.set({ quoteKind: QuoteKind.Single });

  await Promise.all(paths.map(createDirHandler({ morph, ...config })));
};

type DirHandlerConfig = Omit<IndexItConfiguration, 'paths'> & {
  morph: Project;
};

const createDirHandler =
  (config: DirHandlerConfig) => async (pathStr: string) => {
    const dir = await fg(path.join(process.cwd(), pathStr), {});

    const filesExports = readFilesExports({
      ...config,
      dir
    });

    await createIndexFile({ pathStr, filesExports, ...config });
  };
