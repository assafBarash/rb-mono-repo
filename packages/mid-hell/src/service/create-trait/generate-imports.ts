import { TypeExportInfo } from '../../types'
import { AliasedImport, createAliasedImports } from './alias-imports'

type GenerateImportsParams = {
  readonly typeExports: readonly TypeExportInfo[]
  readonly dstPath: string
}

export const generateImports = (
  params: GenerateImportsParams
): readonly string[] => {
  const aliasedImports = createAliasedImports(params)
  const importMap = groupAliasedImportsByPath(aliasedImports)
  return Array.from(importMap.entries()).map(([importPath, imports]) =>
    formatAliasedImportStatement({ importPath, aliasedImports: imports })
  )
}

const groupAliasedImportsByPath = (
  aliasedImports: readonly AliasedImport[]
): Map<string, readonly AliasedImport[]> =>
  aliasedImports.reduce((acc, aliasedImport) => {
    const existing = acc.get(aliasedImport.importPath) ?? []
    return new Map(acc).set(aliasedImport.importPath, [
      ...existing,
      aliasedImport
    ])
  }, new Map<string, readonly AliasedImport[]>())

type FormatAliasedImportStatementParams = {
  readonly importPath: string
  readonly aliasedImports: readonly AliasedImport[]
}

const formatAliasedImportStatement = ({
  importPath,
  aliasedImports
}: FormatAliasedImportStatementParams): string => {
  const importSpecs = aliasedImports.map(({ originalName, alias }) =>
    originalName === alias ? originalName : `${originalName} as ${alias}`
  )

  if (importSpecs.length === 1) {
    return `import type { ${importSpecs[0]} } from '${importPath}';`
  }
  return `import type {\n  ${importSpecs.join(',\n  ')}\n} from '${importPath}';`
}
