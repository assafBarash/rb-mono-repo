"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const parser_1 = require("./ast-parser/parser");
const main = async () => {
    const scriptContent = await promises_1.default.readFile(path_1.default.join('test', '.zshrc'), 'utf8');
    // const scriptContent = `
    //  ## @brief Simple function
    //       ## @usage myFunc
    //       ## @params
    //       ## -@param1 Description for param1
    //       myFunc() {
    //           echo "Hello, World!"
    //       }`;
    const ast = (0, parser_1.parseZshFunctions)(scriptContent);
    const [tree] = ast.functions;
    console.log(tree || ast.functions);
};
main().catch((err) => console.log('## Failed', err));
