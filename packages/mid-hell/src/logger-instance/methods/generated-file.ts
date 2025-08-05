import { LoggerContext } from '../types'

export const createGeneratedFileLog =
  ({ logger, dstPath }: LoggerContext) =>
  (): void => {
    logger.log(`Generated union type file: ${dstPath}`)
  }
