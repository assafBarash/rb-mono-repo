import { JsonObject } from 'type-fest';
import { parseParams } from './parse-params';

export const parseDoxygen = (commentBlock: string): JsonObject => {
  type DoxygenDocWithState = JsonObject & {
    currentSection: keyof JsonObject | null;
  };

  const lines = commentBlock
    .split('\n')
    .map((line) => line.replace(/^#\s*/, '').trim()); // Clean up comments

  const { currentSection, ...result } = lines.reduce<DoxygenDocWithState>(
    (doc, line, index) => {
      const [key, ...valueParts] = line.split(' ');
      const value = valueParts.join(' ').trim();

      // Detect new sections
      if (key.startsWith('@')) {
        const section = key.slice(1) as keyof JsonObject;

        if (section === 'params') {
          return {
            ...doc,
            currentSection: 'params',
            params: parseParams(lines.slice(index + 1)) // Pass only the remaining lines to `parseParams`
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
    },
    {} as DoxygenDocWithState
  );

  return result;
};
