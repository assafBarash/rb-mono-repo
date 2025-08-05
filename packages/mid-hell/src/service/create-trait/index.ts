import { LiteralLogger } from '../../logger-instance'
import { Context, ScriptOptions, TypeExportInfo } from '../../types'
import { generateImports } from './generate-imports'
import { generateUnion } from './generate-union'
import { saveTraitFile } from './save-file'
import { scanExports } from './scan-exports'

export const executeTraitGeneration = async ({
  src,
  dst,
  ingredients,
  name,
  verbose = false
}: ScriptOptions): Promise<void> => {
  const context: Context = { dstPath: dst, unionTypeName: name, verbose }
  const logger = LiteralLogger(context)

  logger.logScanProgress({ src, ingredients })

  const typeExports: readonly TypeExportInfo[] = await scanExports({
    srcPatterns: src,
    ingredients
  })

  if (!typeExports.length) return logger.logNoMatches()

  logger.logFoundExports({ typeExports })

  const imports = generateImports({ typeExports, dstPath: dst })
  const union = generateUnion({
    typeExports,
    unionTypeName: name,
    dstPath: dst
  })

  saveTraitFile({ imports, traitCode: union, dstPath: dst })
  logger.logGeneratedFile()
}
