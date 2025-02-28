"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDoxygen = void 0;
const parse_params_1 = require("./parse-params");
const parseDoxygen = (commentBlock) => {
    const lines = commentBlock
        .split('\n')
        .map((line) => line.replace(/^#\s*/, '').trim()); // Clean up comments
    const { currentSection, ...result } = lines.reduce((doc, line, index) => {
        const [key, ...valueParts] = line.split(' ');
        const value = valueParts.join(' ').trim();
        // Detect new sections
        if (key.startsWith('@')) {
            const section = key.slice(1);
            if (section === 'params') {
                return {
                    ...doc,
                    currentSection: 'params',
                    params: (0, parse_params_1.parseParams)(lines.slice(index + 1)) // Pass only the remaining lines to `parseParams`
                };
            }
            return { ...doc, currentSection: section, [section]: value || '' };
        }
        // Append to the last detected section (multi-line descriptions)
        if (doc.currentSection && doc.currentSection !== 'params') {
            return {
                ...doc,
                [doc.currentSection]: doc[doc.currentSection]
                    ? `${doc[doc.currentSection]} ${line}`
                    : line
            };
        }
        return doc;
    }, {});
    return result;
};
exports.parseDoxygen = parseDoxygen;
