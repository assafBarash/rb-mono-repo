#!/usr/bin/env node

import { readConfig } from './easy-idx/config';
import { EasyIdx } from './easy-idx/service';

const main = async () => {
  console.log('## Start');

  try {
    const { plugins } = await readConfig();
    plugins.forEach(async (config) => {
      await EasyIdx(config);
    });
  } catch (err) {
    if ((err as { code?: string })?.code === 'ENOENT') {
      throw new Error(
        `## missing indexiterity.config.json in ${process.cwd()}`
      );
    }

    throw err;
  }

  console.log('## End');
};

main().catch((err) => {
  console.log('## Failed', err);
});
