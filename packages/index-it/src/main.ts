#!/usr/bin/env node

import { readConfig } from './config';
import { IndexIt } from './create-index/service';

const main = async () => {
  try {
    const { plugins } = await readConfig();
    plugins.forEach(async (config) => {
      await IndexIt(config);
    });
  } catch (err) {
    if ((err as { code?: string })?.code === 'ENOENT') {
      throw new Error(`## missing index-it.config.json in ${process.cwd()}`);
    }

    throw err;
  }
};

main().catch((err) => {
  console.log('## Failed', err);
});
