import path from 'path'
import { TypeExportInfo } from '../../types'

type Params = {
  readonly typeExports: readonly TypeExportInfo[]
  readonly dstPath: string
}

export type AliasedImport = {
  readonly originalName: string
  readonly alias: string
  readonly importPath: string
}

export const createAliasedImports = ({
  typeExports,
  dstPath
}: Params): readonly AliasedImport[] =>
  typeExports.map(({ typeName, filePath }, aliasIndex) => {
    const importPath = normalizeImportPath({ filePath, dstPath })
    const alias = generateAlphabeticalAlias(aliasIndex)

    return { originalName: typeName, alias, importPath }
  })

type NormalizeImportPathParams = {
  readonly filePath: string
  readonly dstPath: string
}

const normalizeImportPath = ({
  filePath,
  dstPath
}: NormalizeImportPathParams): string => {
  const relativePath = path
    .relative(path.dirname(dstPath), filePath)
    .replace(/\.(ts|tsx)$/, '')
    .replace(/\\/g, '/')

  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
}

const generateAlphabeticalAlias = (index: number): string => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  const generateAlias = (remaining: number): string =>
    remaining < 26
      ? alphabet[remaining]
      : generateAlias(Math.floor(remaining / 26) - 1) + alphabet[remaining % 26]

  return generateAlias(index)
}
