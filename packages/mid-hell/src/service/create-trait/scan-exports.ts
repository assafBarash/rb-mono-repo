import { Project, SourceFile, TypeAliasDeclaration } from 'ts-morph'
import { TypeExportInfo } from '../../types'
import path from 'path'
import fg from 'fast-glob'

type Params = {
  readonly srcPatterns: readonly string[]
  readonly ingredients: readonly string[]
}

export const scanExports = async ({
  srcPatterns,
  ingredients
}: Params): Promise<readonly TypeExportInfo[]> => {
  const files = await fg([...srcPatterns], {
    ignore: ['node_modules/**', 'dist/**', '**/*.d.ts'],
    onlyFiles: true
  })

  return files.sort().flatMap(processSourceFile(ingredients))
}

const processSourceFile =
  (ingredients: readonly string[]) =>
  (filePath: string): readonly TypeExportInfo[] => {
    try {
      const project = new Project()
      const sourceFile = project.addSourceFileAtPath(filePath)
      const exportedTypes = extractExportTypes({ sourceFile, ingredients })

      return exportedTypes.map(
        (typeName: string): TypeExportInfo => ({
          typeName,
          filePath,
          relativePath: path.relative(path.dirname(filePath), filePath)
        })
      )
    } catch (error) {
      console.warn(`Warning: Could not process file ${filePath}:`, error)
      return []
    }
  }

type ExtractExportTypesParams = {
  readonly sourceFile: SourceFile
  readonly ingredients: readonly string[]
}

const extractExportTypes = ({
  sourceFile,
  ingredients
}: ExtractExportTypesParams): readonly string[] => {
  const typeAliases = sourceFile.getTypeAliases()

  return typeAliases
    .filter(
      (typeAlias: TypeAliasDeclaration) =>
        typeAlias.isExported() && ingredients.includes(typeAlias.getName())
    )
    .map((typeAlias: TypeAliasDeclaration) => typeAlias.getName())
}
