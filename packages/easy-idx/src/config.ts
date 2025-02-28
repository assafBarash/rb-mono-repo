import fs from 'fs/promises';
import path from 'path';
import { IndexItConfiguration } from './easy-idx/types';
import { CONFIG_FILE } from './constants';

type Config = { plugins: IndexItConfiguration[] };

export const readConfig = async (): Promise<Config> =>
  JSON.parse(
    (
      await fs.readFile(path.join(process.cwd(), CONFIG_FILE), 'utf-8')
    ).toString()
  );
