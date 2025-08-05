import { Project, QuoteKind, SourceFile } from 'ts-morph'

type CreateDestinationFileParams = {
  readonly imports: readonly string[]
  readonly traitCode: string
  readonly dstPath: string
}

export const saveTraitFile = ({
  imports,
  traitCode,
  dstPath
}: CreateDestinationFileParams): void => {
  const project = createTsMorphProject()
  const sourceFile = project.createSourceFile(dstPath, '', { overwrite: true })

  imports.forEach(appendImport(sourceFile))

  appendTrait({ sourceFile, traitCode })

  sourceFile.insertText(0, '// auto-generated::ts-literal-split\n\n')
  sourceFile.saveSync()
}

const createTsMorphProject = (): Project =>
  new Project({
    manipulationSettings: {
      quoteKind: QuoteKind.Single
    }
  })

const appendImport = (sourceFile: SourceFile) => (importStatement: string) => {
  const moduleSpecifier = extractModuleSpecifier(importStatement)
  const namedImports = extractNamedImports(importStatement)

  if (moduleSpecifier) {
    sourceFile.addImportDeclaration({
      moduleSpecifier,
      namedImports,
      isTypeOnly: true
    })
  }
}

type AppendTraitParams = {
  readonly sourceFile: SourceFile
  readonly traitCode: string
}

const appendTrait = ({ sourceFile, traitCode }: AppendTraitParams): void => {
  const parsedUnion = parseUnionTypeDeclaration(traitCode)
  if (parsedUnion) {
    sourceFile.addTypeAlias({
      name: parsedUnion.name,
      type: parsedUnion.type,
      isExported: true
    })
  }
}

const extractModuleSpecifier = (importStatement: string): string | null => {
  const moduleMatch = importStatement.match(/from '(.+)'/)
  return moduleMatch?.[1] ?? null
}

const extractNamedImports = (importStatement: string): string[] => {
  const namedImportsMatch = importStatement.match(/{\s*([^}]+)\s*}/)
  return namedImportsMatch?.[1]?.split(',').map(s => s.trim()) ?? []
}

const parseUnionTypeDeclaration = (traitCode: string) => {
  const unionMatch = traitCode.match(/export type (\w+) = ([\s\S]*?);/)
  return unionMatch ? { name: unionMatch[1], type: unionMatch[2].trim() } : null
}
