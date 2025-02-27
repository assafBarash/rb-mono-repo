import fs from 'fs/promises';
import path from 'path';
import { IndexItConfiguration } from './create-index/types';

type Config = { plugins: IndexItConfiguration[] };

export const readConfig = async (): Promise<Config> =>
  JSON.parse(
    (
      await fs.readFile(
        path.join(process.cwd(), 'indexiterity.config.json'),
        'utf-8'
      )
    ).toString()
  );
