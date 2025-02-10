import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import { parseZshFunctions } from './ast-parser/parser';

const main = async () => {
  const scriptContent = await fs.readFile(path.join('test', '.zshrc'), 'utf8');
  // const scriptContent = `
  //  ## @brief Simple function
  //       ## @usage myFunc
  //       ## @params
  //       ## -@param1 Description for param1
  //       myFunc() {
  //           echo "Hello, World!"
  //       }`;
  const ast = parseZshFunctions(scriptContent);
  const [tree] = ast.functions;

  console.log(tree || ast.functions);
};

main().catch((err) => console.log('## Failed', err));
