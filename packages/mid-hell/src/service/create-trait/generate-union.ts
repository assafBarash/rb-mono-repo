import { ExportInfo } from '../../types'
import { createAliasedImports } from './alias-imports'

type Params = {
  readonly exportInfos: readonly ExportInfo[]
  readonly unionTypeName: string
  readonly dstPath: string
}

export const generateUnion = ({ unionTypeName, exportInfos, dstPath }: Params): string => {
  const aliasedImports = createAliasedImports({ exportInfos, dstPath })
  const uniqueAliases = [...new Set(aliasedImports.map(imp => imp.alias))]

  if (uniqueAliases.length === 0) {
    return `export type ${unionTypeName} = never;`
  }

  if (uniqueAliases.length === 1) {
    return `export type ${unionTypeName} = ${uniqueAliases[0]};`
  }

  return `export type ${unionTypeName} = \n  | ${uniqueAliases.join('\n  | ')};`
}
