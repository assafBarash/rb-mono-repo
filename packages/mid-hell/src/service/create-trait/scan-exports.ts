import { Project, SourceFile, TypeAliasDeclaration, VariableDeclaration } from 'ts-morph'
import { ExportInfo } from '../../types'
import path from 'path'
import fg from 'fast-glob'

type Params = {
  readonly srcPatterns: readonly string[]
  readonly ingredients: readonly string[]
  readonly mode?: 'type' | 'const'
}

export const scanExports = async ({
  srcPatterns,
  ingredients,
  mode = 'type'
}: Params): Promise<readonly ExportInfo[]> => {
  const files = await fg([...srcPatterns], {
    ignore: ['node_modules/**', 'dist/**', '**/*.d.ts'],
    onlyFiles: true
  })

  return files.sort().flatMap(processSourceFile(ingredients, mode))
}

const processSourceFile =
  (ingredients: readonly string[], mode: 'type' | 'const') =>
  (filePath: string): readonly ExportInfo[] => {
    try {
      const project = new Project()
      const sourceFile = project.addSourceFileAtPath(filePath)
      const exportedNames = mode === 'type' 
        ? extractExportTypes({ sourceFile, ingredients })
        : extractExportConsts({ sourceFile, ingredients })

      return exportedNames.map(
        (exportName: string): ExportInfo => ({
          exportName,
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

type ExtractExportConstsParams = {
  readonly sourceFile: SourceFile
  readonly ingredients: readonly string[]
}

const extractExportConsts = ({
  sourceFile,
  ingredients
}: ExtractExportConstsParams): readonly string[] => {
  const variableStatements = sourceFile.getVariableStatements()

  return variableStatements
    .filter(statement => statement.isExported())
    .flatMap(statement => 
      statement.getDeclarations()
        .filter((declaration: VariableDeclaration) => 
          ingredients.includes(declaration.getName())
        )
        .map((declaration: VariableDeclaration) => declaration.getName())
    )
}
