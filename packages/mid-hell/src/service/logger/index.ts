import { Context } from '../../types'
import { createScanProgressLog } from './methods/scan-progress'
import { createFoundExportsLog } from './methods/found-exports'
import { createGeneratedFileLog } from './methods/generated-file'
import { createNoMatchesLog } from './methods/no-matches'
import { ILogger, LoggerContext } from './types'

export const LiteralLogger = ({ dstPath, verbose = false }: Context) => {
  const logger: ILogger = {
    log: (...args: unknown[]) => verbose && console.log(...args),
    warn: (...args: unknown[]) => verbose && console.warn(...args)
  }

  const loggerContext: LoggerContext = { logger, dstPath }

  return {
    logScanProgress: createScanProgressLog(loggerContext),
    logFoundExports: createFoundExportsLog(loggerContext),
    logGeneratedFile: createGeneratedFileLog(loggerContext),
    logNoMatches: createNoMatchesLog(loggerContext)
  }
}
