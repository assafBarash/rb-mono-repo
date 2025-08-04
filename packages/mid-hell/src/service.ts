import * as path from 'path'
import fg from 'fast-glob'
import { Project, SourceFile, TypeAliasDeclaration, QuoteKind } from 'ts-morph'

export type TypeExportInfo = {
  readonly typeName: string
  readonly filePath: string
  readonly relativePath: string
}

export type ScriptOptions = {
  readonly src: readonly string[]
  readonly dst: string
  readonly ingredients: readonly string[]
  readonly name: string
  readonly verbose?: boolean
}

type CreateLoggerParams = {
  readonly verbose: boolean
}

type AliasedImport = {
  readonly originalName: string
  readonly alias: string
  readonly importPath: string
}

type Logger = {
  readonly log: (...args: unknown[]) => void
  readonly warn: (...args: unknown[]) => void
}

type ExtractExportTypesParams = {
  readonly sourceFile: SourceFile
  readonly ingredients: readonly string[]
}

type ProcessSourceFileParams = {
  readonly filePath: string
  readonly ingredients: readonly string[]
}

type ScanForTypeExportsParams = {
  readonly srcPatterns: readonly string[]
  readonly ingredients: readonly string[]
}

type NormalizeImportPathParams = {
  readonly filePath: string
  readonly dstPath: string
}

type CreateAliasedImportsParams = {
  readonly typeExports: readonly TypeExportInfo[]
  readonly dstPath: string
}

type FormatAliasedImportStatementParams = {
  readonly importPath: string
  readonly aliasedImports: readonly AliasedImport[]
}

type GenerateImportsParams = {
  readonly typeExports: readonly TypeExportInfo[]
  readonly dstPath: string
}

type GenerateUnionTypeParams = {
  readonly typeExports: readonly TypeExportInfo[]
  readonly unionTypeName: string
  readonly dstPath: string
}

type AddImportsToSourceFileParams = {
  readonly sourceFile: SourceFile
  readonly imports: readonly string[]
}

type AddUnionTypeToSourceFileParams = {
  readonly sourceFile: SourceFile
  readonly unionTypeCode: string
}

type CreateDestinationFileParams = {
  readonly imports: readonly string[]
  readonly unionTypeCode: string
  readonly dstPath: string
}

type LogScanProgressParams = {
  readonly src: readonly string[]
  readonly ingredients: readonly string[]
  readonly logger: Logger
}

type LogFoundExportsParams = {
  readonly typeExports: readonly TypeExportInfo[]
  readonly logger: Logger
}

type LogGeneratedFileParams = {
  readonly dst: string
  readonly logger: Logger
}

type LogNoMatchesParams = {
  readonly logger: Logger
}

const createLogger = (params: CreateLoggerParams): Logger => {
  const { verbose } = params
  return {
    log: (...args: unknown[]) => verbose && console.log(...args),
    warn: (...args: unknown[]) => verbose && console.warn(...args)
  }
}

const createTsMorphProject = (): Project =>
  new Project({
    manipulationSettings: {
      quoteKind: QuoteKind.Single
    }
  })

const extractExportTypes = (
  params: ExtractExportTypesParams
): readonly string[] => {
  const { sourceFile, ingredients } = params
  const typeAliases = sourceFile.getTypeAliases()

  return typeAliases
    .filter(
      (typeAlias: TypeAliasDeclaration) =>
        typeAlias.isExported() && ingredients.includes(typeAlias.getName())
    )
    .map((typeAlias: TypeAliasDeclaration) => typeAlias.getName())
}

const processSourceFile = (
  params: ProcessSourceFileParams
): readonly TypeExportInfo[] => {
  const { filePath, ingredients } = params
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

const scanForTypeExports = async (
  params: ScanForTypeExportsParams
): Promise<readonly TypeExportInfo[]> => {
  const { srcPatterns, ingredients } = params
  const files = await fg([...srcPatterns], {
    ignore: ['node_modules/**', 'dist/**', '**/*.d.ts'],
    onlyFiles: true
  })

  return files.flatMap((filePath: string) =>
    processSourceFile({ filePath, ingredients })
  )
}

const normalizeImportPath = (params: NormalizeImportPathParams): string => {
  const { filePath, dstPath } = params
  const relativePath = path
    .relative(path.dirname(dstPath), filePath)
    .replace(/\.(ts|tsx)$/, '')
    .replace(/\\/g, '/')

  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
}

const generateAlphabeticalAlias = (index: number): string => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  let current = index

  do {
    result = alphabet[current % 26] + result
    current = Math.floor(current / 26)
  } while (current > 0)

  return result
}

const createAliasedImports = (
  params: CreateAliasedImportsParams
): readonly AliasedImport[] => {
  const { typeExports, dstPath } = params
  let aliasIndex = 0

  return typeExports.map(exportInfo => {
    const { typeName, filePath } = exportInfo
    const importPath = normalizeImportPath({ filePath, dstPath })
    const alias = generateAlphabeticalAlias(aliasIndex)
    aliasIndex++

    return { originalName: typeName, alias, importPath }
  })
}

const groupAliasedImportsByPath = (
  aliasedImports: readonly AliasedImport[]
): Map<string, readonly AliasedImport[]> => {
  return aliasedImports.reduce((acc, aliasedImport) => {
    const existing = acc.get(aliasedImport.importPath) ?? []
    return new Map(acc).set(aliasedImport.importPath, [
      ...existing,
      aliasedImport
    ])
  }, new Map<string, readonly AliasedImport[]>())
}

const formatAliasedImportStatement = (
  params: FormatAliasedImportStatementParams
): string => {
  const { importPath, aliasedImports } = params
  const importSpecs = aliasedImports.map(({ originalName, alias }) =>
    originalName === alias ? originalName : `${originalName} as ${alias}`
  )

  if (importSpecs.length === 1) {
    return `import type { ${importSpecs[0]} } from '${importPath}';`
  }
  return `import type {\n  ${importSpecs.join(',\n  ')}\n} from '${importPath}';`
}

const generateImports = (params: GenerateImportsParams): readonly string[] => {
  const { typeExports, dstPath } = params
  const aliasedImports = createAliasedImports({ typeExports, dstPath })
  const importMap = groupAliasedImportsByPath(aliasedImports)
  return Array.from(importMap.entries()).map(([importPath, imports]) =>
    formatAliasedImportStatement({ importPath, aliasedImports: imports })
  )
}

const generateUnionType = (params: GenerateUnionTypeParams): string => {
  const { typeExports, unionTypeName, dstPath } = params
  const aliasedImports = createAliasedImports({ typeExports, dstPath })
  const uniqueAliases = [...new Set(aliasedImports.map(imp => imp.alias))]

  if (uniqueAliases.length === 0) {
    return `export type ${unionTypeName} = never;`
  }

  if (uniqueAliases.length === 1) {
    return `export type ${unionTypeName} = ${uniqueAliases[0]};`
  }

  return `export type ${unionTypeName} = \n  | ${uniqueAliases.join('\n  | ')};`
}

const extractModuleSpecifier = (importStatement: string): string | null => {
  const moduleMatch = importStatement.match(/from '(.+)'/)
  return moduleMatch?.[1] ?? null
}

const extractNamedImports = (importStatement: string): string[] => {
  const namedImportsMatch = importStatement.match(/{\s*([^}]+)\s*}/)
  return namedImportsMatch?.[1]?.split(',').map(s => s.trim()) ?? []
}

const addImportsToSourceFile = (params: AddImportsToSourceFileParams): void => {
  const { sourceFile, imports } = params
  imports.forEach(importStatement => {
    const moduleSpecifier = extractModuleSpecifier(importStatement)
    const namedImports = extractNamedImports(importStatement)

    if (moduleSpecifier) {
      sourceFile.addImportDeclaration({
        moduleSpecifier,
        namedImports,
        isTypeOnly: true
      })
    }
  })
}

const parseUnionTypeDeclaration = (unionTypeCode: string) => {
  const unionMatch = unionTypeCode.match(/export type (\w+) = ([\s\S]*?);/)
  return unionMatch ? { name: unionMatch[1], type: unionMatch[2].trim() } : null
}

const addUnionTypeToSourceFile = (
  params: AddUnionTypeToSourceFileParams
): void => {
  const { sourceFile, unionTypeCode } = params
  const parsedUnion = parseUnionTypeDeclaration(unionTypeCode)
  if (parsedUnion) {
    sourceFile.addTypeAlias({
      name: parsedUnion.name,
      type: parsedUnion.type,
      isExported: true
    })
  }
}

const logScanProgress = (params: LogScanProgressParams): void => {
  const { src, ingredients, logger } = params
  logger.log('Scanning for type exports...')
  logger.log('Source patterns:', src)
  logger.log('Looking for ingredients:', ingredients)
}

const logFoundExports = (params: LogFoundExportsParams): void => {
  const { typeExports, logger } = params
  logger.log(`Found ${typeExports.length} type exports:`)
  typeExports.forEach(exp => {
    logger.log(`  - ${exp.typeName} from ${exp.filePath}`)
  })
}

const logGeneratedFile = (params: LogGeneratedFileParams): void => {
  const { dst, logger } = params
  logger.log(`Generated union type file: ${dst}`)
}

const logNoMatches = (params: LogNoMatchesParams): void => {
  const { logger } = params
  logger.warn('No matching type exports found!')
}

const createDestinationFile = (params: CreateDestinationFileParams): void => {
  const { imports, unionTypeCode, dstPath } = params
  const project = createTsMorphProject()
  const sourceFile = project.createSourceFile(dstPath, '', { overwrite: true })

  addImportsToSourceFile({ sourceFile, imports })
  addUnionTypeToSourceFile({ sourceFile, unionTypeCode })

  sourceFile.insertText(0, '// auto-generated::ts-literal-split\n\n')
  sourceFile.saveSync()
}

export const generateTypeUnion = async (
  options: ScriptOptions
): Promise<void> => {
  const { src, dst, ingredients, name, verbose = false } = options
  const logger = createLogger({ verbose })

  logScanProgress({ src, ingredients, logger })

  const typeExports = await scanForTypeExports({
    srcPatterns: src,
    ingredients
  })

  if (typeExports.length === 0) {
    logNoMatches({ logger })
    return
  }

  logFoundExports({ typeExports, logger })

  const imports = generateImports({ typeExports, dstPath: dst })
  const unionType = generateUnionType({
    typeExports,
    unionTypeName: name,
    dstPath: dst
  })

  createDestinationFile({ imports, unionTypeCode: unionType, dstPath: dst })
  logGeneratedFile({ dst, logger })
}
