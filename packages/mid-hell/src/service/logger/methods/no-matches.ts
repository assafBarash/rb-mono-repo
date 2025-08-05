import { LoggerContext } from '../types'

export const createNoMatchesLog =
  ({ logger }: LoggerContext) =>
  (): void => {
    logger.warn('No matching type exports found!')
  }
