import { LoggerContext } from '../types'

type Params = {
  readonly src: readonly string[]
  readonly ingredients: readonly string[]
}

export const createScanProgressLog =
  ({ logger }: LoggerContext) =>
  ({ src, ingredients }: Params): void => {
    logger.log('Scanning for type exports...')
    logger.log('Source patterns:', src)
    logger.log('Looking for ingredients:', ingredients)
  }
