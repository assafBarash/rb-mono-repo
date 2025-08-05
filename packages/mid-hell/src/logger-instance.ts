import { Context, TypeExportInfo } from './types'

type ScanProgressLogParams = {
  readonly src: readonly string[]
  readonly ingredients: readonly string[]
}

type Logger = {
  readonly log: (...args: unknown[]) => void
  readonly warn: (...args: unknown[]) => void
}

export const createLoggerInstance = (context: Context) => {
  const { dstPath, verbose = false } = context

  const logger: Logger = {
    log: (...args: unknown[]) => verbose && console.log(...args),
    warn: (...args: unknown[]) => verbose && console.warn(...args)
  }

  const logScanProgress = (params: ScanProgressLogParams): void => {
    const { src, ingredients } = params
    logger.log('Scanning for type exports...')
    logger.log('Source patterns:', src)
    logger.log('Looking for ingredients:', ingredients)
  }

  const logFoundExports = (typeExports: readonly TypeExportInfo[]): void => {
    logger.log(`Found ${typeExports.length} type exports:`)
    typeExports.forEach(exp => {
      logger.log(`  - ${exp.typeName} from ${exp.filePath}`)
    })
  }

  const logGeneratedFile = (): void => {
    logger.log(`Generated union type file: ${dstPath}`)
  }

  const logNoMatches = (): void => {
    logger.warn('No matching type exports found!')
  }

  return {
    logScanProgress,
    logFoundExports,
    logGeneratedFile,
    logNoMatches
  }
}
