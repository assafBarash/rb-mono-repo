export const parseParams = (lines: string[], depth = 1): Record<string, any> =>
  lines.reduce<Record<string, any>>((params, line, index, allLines) => {
    const match = line
      .trim()
      .match(new RegExp(`^(-{${depth}})@([a-zA-Z0-9_]+)\\s*(.*)?$`));

    if (!match) return params;

    const [, prefix, key, value] = match;
    const level = prefix.length; // Determines depth of nesting

    // Find the next top-level key to limit the scope of children
    const nextSameLevelIndex = allLines
      .slice(index + 1)
      .findIndex(
        (l) =>
          l.startsWith('-'.repeat(depth)) &&
          !l.startsWith('-'.repeat(depth + 1))
      );

    const nestedLines =
      nextSameLevelIndex === -1
        ? allLines.slice(index + 1)
        : allLines.slice(index + 1, index + 1 + nextSameLevelIndex);

    const parsedChildren =
      nestedLines.length > 0 ? parseParams(nestedLines, level + 1) : {};

    return {
      ...params,
      [key]:
        Object.keys(parsedChildren).length > 0
          ? parsedChildren // Keep children only if they exist
          : value?.trim() || {}
    };
  }, {});
