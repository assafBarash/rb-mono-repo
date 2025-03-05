#!/usr/bin/env node

import { readConfig } from './easy-idx/config';
import { EasyIdx } from './easy-idx/service';

const main = async () => {
  try {
    const { plugins } = await readConfig();
    await Promise.all(
      plugins.flatMap(async ({ paths = [], ...config }) => {
        const easyIdx = EasyIdx(config);
        paths.map(easyIdx.createPathExportsIndex);
      })
    );
  } catch (err) {
    if ((err as { code?: string })?.code === 'ENOENT') {
      throw new Error(
        `## missing indexiterity.config.json in ${process.cwd()}`
      );
    }

    throw err;
  }
};

main().catch((err) => {
  throw err;
});
