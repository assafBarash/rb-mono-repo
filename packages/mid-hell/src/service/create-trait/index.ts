import { LiteralLogger } from '../../logger-instance'
import { Context, ScriptOptions, TypeExportInfo } from '../../types'
import { generateImports } from './generate-imports'
import { generateUnion } from './generate-union'
import { saveTraitFile } from './save-file'
import { scanExports } from './scan-exports'

export const createTrait = async ({
  src,
  dst,
  ingredients,
  name,
  verbose = false
}: ScriptOptions): Promise<void> => {
  const context: Context = { dstPath: dst, unionTypeName: name, verbose }

  const loggerInstance = LiteralLogger(context)

  loggerInstance.logScanProgress({ src, ingredients })

  const typeExports: readonly TypeExportInfo[] = await scanExports({
    srcPatterns: src,
    ingredients
  })

  if (typeExports.length === 0) {
    loggerInstance.logNoMatches()
    return
  }

  loggerInstance.logFoundExports({ typeExports })

  const imports = generateImports({ typeExports, dstPath: dst })
  const union = generateUnion({
    typeExports,
    unionTypeName: name,
    dstPath: dst
  })

  saveTraitFile({ imports, traitCode: union, dstPath: dst })
  loggerInstance.logGeneratedFile()
}
