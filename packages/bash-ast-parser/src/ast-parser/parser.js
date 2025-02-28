"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseZshFunctions = void 0;
const parse_doxygen_1 = require("./parse-doxygen");
/**
 * Parses a Zsh script and extracts function definitions.
 * @param scriptContent The content of a .zshrc file
 * @returns A ZshAST object containing parsed function metadata
 */
const parseZshFunctions = (scriptContent) => {
    return scriptContent
        .split('\n')
        .reduce((state, line) => {
        const trimmed = line.trim();
        return trimmed.startsWith('##')
            ? {
                ...state,
                comments: [...state.comments, trimmed.replace(/^##\s*/, '')]
            }
            : trimmed.match(/^([a-zA-Z0-9_-]+)\(\)\s*\{/)
                ? {
                    ...state,
                    currentFunction: {
                        type: 'Function',
                        name: trimmed.match(/^([a-zA-Z0-9_-]+)\(\)\s*\{/)[1],
                        body: '',
                        doxygen: state.comments.length > 0
                            ? (0, parse_doxygen_1.parseDoxygen)(state.comments.join('\n'))
                            : undefined
                    },
                    comments: []
                }
                : trimmed === '}' && state.currentFunction
                    ? {
                        functions: [...state.functions, state.currentFunction],
                        comments: [],
                        currentFunction: null
                    }
                    : state.currentFunction
                        ? {
                            ...state,
                            currentFunction: {
                                ...state.currentFunction,
                                body: `${state.currentFunction.body}\n${trimmed}`.trim()
                            }
                        }
                        : state;
    }, { functions: [], comments: [], currentFunction: null })
        .functions.reduce((acc, fn) => ({ type: 'ZshScript', functions: [...acc.functions, fn] }), { type: 'ZshScript', functions: [] });
};
exports.parseZshFunctions = parseZshFunctions;
