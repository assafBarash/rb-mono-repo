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

const groupTypesByFile = (
  typeExports: readonly TypeExportInfo[],
  dstPath: string
): Map<string, readonly string[]> => {
  return typeExports.reduce((acc, exportInfo) => {
    const importPath = normalizeImportPath(exportInfo.filePath, dstPath)
    const existingTypes = acc.get(importPath) ?? []
    const updatedTypes = existingTypes.includes(exportInfo.typeName)
      ? existingTypes
      : [...existingTypes, exportInfo.typeName]

    return new Map(acc).set(importPath, updatedTypes)
  }, new Map<string, readonly string[]>())
}

const formatImportStatement = (
  importPath: string,
  types: readonly string[]
): string => {
  if (types.length === 1) {
    return `import type { ${types[0]} } from '${importPath}';`
  }
  return `import type {\n  ${types.join(',\n  ')}\n} from '${importPath}';`
}

const generateImports = (
  typeExports: readonly TypeExportInfo[],
  dstPath: string
): readonly string[] => {
  const importMap = groupTypesByFile(typeExports, dstPath)
  return Array.from(importMap.entries()).map(([importPath, types]) =>
    formatImportStatement(importPath, types)
  )
}

const generateUnionType = (
  typeExports: readonly TypeExportInfo[],
  unionTypeName: string
): string => {
  const uniqueTypes = [...new Set(typeExports.map(exp => exp.typeName))]

  if (uniqueTypes.length === 0) {
    return `export type ${unionTypeName} = never;`
  }

  if (uniqueTypes.length === 1) {
    return `export type ${unionTypeName} = ${uniqueTypes[0]};`
  }

  return `export type ${unionTypeName} = \n  | ${uniqueTypes.join('\n  | ')};`
}

const addImportsToSourceFile = (
  sourceFile: SourceFile,
  imports: readonly string[]
): void => {
  imports.forEach(importStatement => {
    const moduleMatch = importStatement.match(/from '(.+)'/)
    const namedImportsMatch = importStatement.match(/{\s*([^}]+)\s*}/)

    if (moduleMatch) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: moduleMatch[1],
        namedImports:
          namedImportsMatch?.[1]?.split(',').map(s => s.trim()) ?? [],
        isTypeOnly: true
      })
    }
  })
}

const addUnionTypeToSourceFile = (
  sourceFile: SourceFile,
  unionTypeCode: string
): void => {
  const unionMatch = unionTypeCode.match(/export type (\w+) = ([\s\S]*?);/)
  if (unionMatch) {
    sourceFile.addTypeAlias({
      name: unionMatch[1],
      type: unionMatch[2].trim(),
      isExported: true
    })
  }
}

const createDestinationFile = (
  imports: readonly string[],
  unionTypeCode: string,
  dstPath: string
): void => {
  const project = new Project({
    manipulationSettings: {
      quoteKind: QuoteKind.Single
    }
  })
  const sourceFile = project.createSourceFile(dstPath, '', { overwrite: true })

  sourceFile.insertText(
    0,
    '// This file was auto-generated. Do not edit manually.\n\n'
  )
  addImportsToSourceFile(sourceFile, imports)
  addUnionTypeToSourceFile(sourceFile, unionTypeCode)
  sourceFile.saveSync()
}

const logScanProgress = (
  src: readonly string[],
  ingredients: readonly string[]
): void => {
  console.log('Scanning for type exports...')
  console.log('Source patterns:', src)
  console.log('Looking for ingredients:', ingredients)
}

const logFoundExports = (typeExports: readonly TypeExportInfo[]): void => {
  console.log(`Found ${typeExports.length} type exports:`)
  typeExports.forEach(exp => {
    console.log(`  - ${exp.typeName} from ${exp.filePath}`)
  })
}

export const generateTypeUnion = async (
  options: ScriptOptions
): Promise<void> => {
  const { src, dst, ingredients, name } = options

  logScanProgress(src, ingredients)

  const typeExports = await scanForTypeExports(src, ingredients)

  if (typeExports.length === 0) {
    console.warn('No matching type exports found!')
    return
  }

  logFoundExports(typeExports)

  const imports = generateImports(typeExports, dst)
  const unionType = generateUnionType(typeExports, name)

  createDestinationFile(imports, unionType, dst)
  console.log(`Generated union type file: ${dst}`)
}
