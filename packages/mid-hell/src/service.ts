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

const extractExportTypes = (
  sourceFile: SourceFile,
  ingredients: readonly string[]
): readonly string[] => {
  const typeAliases = sourceFile.getTypeAliases()

  return typeAliases
    .filter(
      (typeAlias: TypeAliasDeclaration) =>
        typeAlias.isExported() && ingredients.includes(typeAlias.getName())
    )
    .map((typeAlias: TypeAliasDeclaration) => typeAlias.getName())
}

const processSourceFile = (
  filePath: string,
  ingredients: readonly string[]
): readonly TypeExportInfo[] => {
  try {
    const project = new Project()
    const sourceFile = project.addSourceFileAtPath(filePath)
    const exportedTypes = extractExportTypes(sourceFile, ingredients)

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
  srcPatterns: readonly string[],
  ingredients: readonly string[]
): Promise<readonly TypeExportInfo[]> => {
  const files = await fg([...srcPatterns], {
    ignore: ['node_modules/**', 'dist/**', '**/*.d.ts'],
    onlyFiles: true
  })

  return files.flatMap((filePath: string) =>
    processSourceFile(filePath, ingredients)
  )
}

const normalizeImportPath = (filePath: string, dstPath: string): string => {
  const relativePath = path
    .relative(path.dirname(dstPath), filePath)
    .replace(/\.(ts|tsx)$/, '')
    .replace(/\\/g, '/')

  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
}

type AliasedImport = {
  readonly originalName: string
  readonly alias: string
  readonly importPath: string
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
  typeExports: readonly TypeExportInfo[],
  dstPath: string
): readonly AliasedImport[] => {
  let aliasIndex = 0

  return typeExports.map(exportInfo => {
    const { typeName, filePath } = exportInfo
    const importPath = normalizeImportPath(filePath, dstPath)
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
  importPath: string,
  aliasedImports: readonly AliasedImport[]
): string => {
  const importSpecs = aliasedImports.map(({ originalName, alias }) =>
    originalName === alias ? originalName : `${originalName} as ${alias}`
  )

  if (importSpecs.length === 1) {
    return `import type { ${importSpecs[0]} } from '${importPath}';`
  }
  return `import type {\n  ${importSpecs.join(',\n  ')}\n} from '${importPath}';`
}

const generateImports = (
  typeExports: readonly TypeExportInfo[],
  dstPath: string
): readonly string[] => {
  const aliasedImports = createAliasedImports(typeExports, dstPath)
  const importMap = groupAliasedImportsByPath(aliasedImports)
  return Array.from(importMap.entries()).map(([importPath, imports]) =>
    formatAliasedImportStatement(importPath, imports)
  )
}

const generateUnionType = (
  typeExports: readonly TypeExportInfo[],
  unionTypeName: string,
  dstPath: string
): string => {
  const aliasedImports = createAliasedImports(typeExports, dstPath)
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

const addImportsToSourceFile = (
  sourceFile: SourceFile,
  imports: readonly string[]
): void => {
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
  sourceFile: SourceFile,
  unionTypeCode: string
): void => {
  const parsedUnion = parseUnionTypeDeclaration(unionTypeCode)
  if (parsedUnion) {
    sourceFile.addTypeAlias({
      name: parsedUnion.name,
      type: parsedUnion.type,
      isExported: true
    })
  }
}

const createProjectWithSingleQuotes = (): Project => {
  return new Project({
    manipulationSettings: {
      quoteKind: QuoteKind.Single
    }
  })
}

const createDestinationFile = (
  imports: readonly string[],
  unionTypeCode: string,
  dstPath: string
): void => {
  const project = createProjectWithSingleQuotes()
  const sourceFile = project.createSourceFile(dstPath, '', { overwrite: true })

  addImportsToSourceFile(sourceFile, imports)
  addUnionTypeToSourceFile(sourceFile, unionTypeCode)

  sourceFile.insertText(0, '// auto-generated::ts-literal-split\n\n')
  sourceFile.saveSync()
}

const createVerboseLogger = (verbose: boolean) => ({
  log: (...args: unknown[]) => verbose && console.log(...args),
  warn: (...args: unknown[]) => verbose && console.warn(...args)
})

const logScanProgress = (
  src: readonly string[],
  ingredients: readonly string[],
  verbose: boolean
): void => {
  const logger = createVerboseLogger(verbose)
  logger.log('Scanning for type exports...')
  logger.log('Source patterns:', src)
  logger.log('Looking for ingredients:', ingredients)
}

const logFoundExports = (
  typeExports: readonly TypeExportInfo[],
  verbose: boolean
): void => {
  const logger = createVerboseLogger(verbose)
  logger.log(`Found ${typeExports.length} type exports:`)
  typeExports.forEach(exp => {
    logger.log(`  - ${exp.typeName} from ${exp.filePath}`)
  })
}

const logGeneratedFile = (dst: string, verbose: boolean): void => {
  const logger = createVerboseLogger(verbose)
  logger.log(`Generated union type file: ${dst}`)
}

const logNoMatches = (verbose: boolean): void => {
  const logger = createVerboseLogger(verbose)
  logger.warn('No matching type exports found!')
}

export const generateTypeUnion = async (
  options: ScriptOptions
): Promise<void> => {
  const { src, dst, ingredients, name, verbose = false } = options

  logScanProgress(src, ingredients, verbose)

  const typeExports = await scanForTypeExports(src, ingredients)

  if (typeExports.length === 0) {
    logNoMatches(verbose)
    return
  }

  logFoundExports(typeExports, verbose)

  const imports = generateImports(typeExports, dst)
  const unionType = generateUnionType(typeExports, name, dst)

  createDestinationFile(imports, unionType, dst)
  logGeneratedFile(dst, verbose)
}
