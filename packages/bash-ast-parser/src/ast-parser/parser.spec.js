"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
describe('parseZshFunctions', () => {
    const cases = [
        {
            name: 'Basic Function with Doxygen',
            input: `
        ## @description Simple function
        ## @usage myFunc
        ## @params
        ## -@param1 Description for param1
        myFunc() {
            echo "Hello, World!"
        }
      `,
            expected: {
                type: 'ZshScript',
                functions: [
                    {
                        type: 'Function',
                        name: 'myFunc',
                        body: 'echo "Hello, World!"',
                        doxygen: {
                            description: 'Simple function',
                            usage: 'myFunc',
                            params: {
                                param1: 'Description for param1'
                            }
                        }
                    }
                ]
            }
        },
        {
            name: 'Function with Nested Parameters',
            input: `
        ## @description Complex function
        ## @usage complexFunc <param1>
        ## @params
        ## -@param1 Top-level param
        ## -@nested
        ## --@subkey1 Sub-key 1
        ## --@subkey2 Sub-key 2
        complexFunc() {
            echo "Complex function executed"
        }
      `,
            expected: {
                type: 'ZshScript',
                functions: [
                    {
                        type: 'Function',
                        name: 'complexFunc',
                        body: 'echo "Complex function executed"',
                        doxygen: {
                            description: 'Complex function',
                            usage: 'complexFunc <param1>',
                            params: {
                                param1: 'Top-level param',
                                nested: {
                                    subkey1: 'Sub-key 1',
                                    subkey2: 'Sub-key 2'
                                }
                            }
                        }
                    }
                ]
            }
        },
        {
            name: 'Function with Multi-line Comments',
            input: `
        ## @description This function does something useful
        ## It spans multiple lines and should be
        ## stored correctly in the output.
        ## @usage multiLineFunc
        multiLineFunc() {
            echo "Handling multi-line comments"
        }
      `,
            expected: {
                type: 'ZshScript',
                functions: [
                    {
                        type: 'Function',
                        name: 'multiLineFunc',
                        body: 'echo "Handling multi-line comments"',
                        doxygen: {
                            description: 'This function does something useful It spans multiple lines and should be stored correctly in the output.',
                            usage: 'multiLineFunc'
                        }
                    }
                ]
            }
        },
        {
            name: 'Function Without Comments',
            input: `
        noCommentFunc() {
            echo "No comments here"
        }
      `,
            expected: {
                type: 'ZshScript',
                functions: [
                    {
                        type: 'Function',
                        name: 'noCommentFunc',
                        body: 'echo "No comments here"',
                        doxygen: undefined
                    }
                ]
            }
        },
        {
            name: 'Function with Empty Body',
            input: `
        ## @description A function with no body
        emptyFunc() {
        }
      `,
            expected: {
                type: 'ZshScript',
                functions: [
                    {
                        type: 'Function',
                        name: 'emptyFunc',
                        body: '',
                        doxygen: {
                            description: 'A function with no body'
                        }
                    }
                ]
            }
        },
        {
            name: 'Function with Indented Parameters',
            input: `
        ## @description Indented parameters test
        ## @params
        ##    -@level1 Top level
        ##        --@level2 Nested param
        ##            ---@level3 Deepest level
        indentedFunc() {
            echo "Indented parameters test"
        }
      `,
            expected: {
                type: 'ZshScript',
                functions: [
                    {
                        type: 'Function',
                        name: 'indentedFunc',
                        body: 'echo "Indented parameters test"',
                        doxygen: {
                            description: 'Indented parameters test',
                            params: {
                                level1: {
                                    level2: {
                                        level3: 'Deepest level'
                                    }
                                }
                            }
                        }
                    }
                ]
            }
        },
        {
            name: 'Multiple Functions in One File',
            input: `
        ## @description First function
        firstFunc() {
            echo "First function"
        }

        ## @description Second function
        secondFunc() {
            echo "Second function"
        }
      `,
            expected: {
                type: 'ZshScript',
                functions: [
                    {
                        type: 'Function',
                        name: 'firstFunc',
                        body: 'echo "First function"',
                        doxygen: {
                            description: 'First function'
                        }
                    },
                    {
                        type: 'Function',
                        name: 'secondFunc',
                        body: 'echo "Second function"',
                        doxygen: {
                            description: 'Second function'
                        }
                    }
                ]
            }
        }
    ];
    cases.forEach(({ name, input, expected }) => {
        test(name, () => {
            const result = (0, parser_1.parseZshFunctions)(input);
            expect(result).toEqual(expected);
        });
    });
});
