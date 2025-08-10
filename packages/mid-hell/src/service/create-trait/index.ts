import { LiteralLogger } from '../logger'
import { Context, ScriptOptions, ExportInfo } from '../../types'
import { generateImports } from './generate-imports'
import { generateUnion } from './generate-union'
import { generateConstArray } from './generate-const-array'
import { saveTraitFile } from './save-file'
import { scanExports } from './scan-exports'

export const createTrait = async ({
  src,
  dst,
  ingredients,
  name,
  verbose = false,
  mode = 'type'
}: ScriptOptions): Promise<void> => {
  const context: Context = { dstPath: dst, unionTypeName: name, verbose }
  const logger = LiteralLogger(context)

  logger.logScanProgress({ src, ingredients })

  const exportInfos: readonly ExportInfo[] = await scanExports({
    srcPatterns: src,
    ingredients,
    mode
  })

  if (!exportInfos.length) return logger.logNoMatches()

  logger.logFoundExports({ typeExports: exportInfos })

  const imports = generateImports({ exportInfos, dstPath: dst })
  const traitCode = mode === 'type' 
    ? generateUnion({
        exportInfos,
        unionTypeName: name,
        dstPath: dst
      })
    : generateConstArray({
        exportInfos,
        arrayName: name,
        dstPath: dst
      })

  saveTraitFile({ imports, traitCode, dstPath: dst })
  logger.logGeneratedFile()
}
