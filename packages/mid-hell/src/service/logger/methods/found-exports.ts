import { ExportInfo } from '../../../types'
import { LoggerContext } from '../types'

type Params = {
  readonly typeExports: readonly ExportInfo[]
}

export const createFoundExportsLog =
  ({ logger }: LoggerContext) =>
  ({ typeExports }: Params): void => {
    logger.log(`Found ${typeExports.length} exports:`)
    typeExports.forEach(exp => {
      logger.log(`  - ${exp.exportName} from ${exp.filePath}`)
    })
  }
