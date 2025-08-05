import { TypeExportInfo } from '../../types'
import { LoggerContext } from '../types'

type Params = {
  readonly typeExports: readonly TypeExportInfo[]
}

export const createFoundExportsLog =
  ({ logger }: LoggerContext) =>
  ({ typeExports }: Params): void => {
    logger.log(`Found ${typeExports.length} type exports:`)
    typeExports.forEach(exp => {
      logger.log(`  - ${exp.typeName} from ${exp.filePath}`)
    })
  }
