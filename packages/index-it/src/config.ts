import fs from 'fs/promises';
import path from 'path';
import { IndexItConfiguration } from './create-index/types';

type Config = { plugins: IndexItConfiguration[] };

export const readConfig = async (): Promise<Config> => {
  return JSON.parse(
    (
      await fs.readFile(
        path.join(process.cwd(), 'index-it.config.json'),
        'utf-8'
      )
    ).toString()
  );
};
