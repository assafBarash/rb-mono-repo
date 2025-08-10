import { ExportInfo } from '../../types'
import { createAliasedImports } from './alias-imports'

type Params = {
  readonly exportInfos: readonly ExportInfo[]
  readonly arrayName: string
  readonly dstPath: string
}

export const generateConstArray = ({ arrayName, exportInfos, dstPath }: Params): string => {
  const aliasedImports = createAliasedImports({ exportInfos, dstPath })
  const uniqueAliases = [...new Set(aliasedImports.map(imp => imp.alias))]

  if (uniqueAliases.length === 0) {
    return `export const ${arrayName} = [] as const;`
  }

  if (uniqueAliases.length === 1) {
    return `export const ${arrayName} = [${uniqueAliases[0]}] as const;`
  }

  return `export const ${arrayName} = [\n  ${uniqueAliases.join(',\n  ')}\n] as const;`
}
