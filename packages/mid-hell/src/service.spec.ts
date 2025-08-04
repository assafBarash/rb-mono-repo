import * as fs from 'fs'
import * as path from 'path'
import { generateTypeUnion } from './service.js'

const TESTS_DIR = path.join(__dirname, '../tests')
const DATA_DIR = path.join(TESTS_DIR, 'data')
const RESULTS_DIR = path.join(TESTS_DIR, 'results')

const cleanupResults = () => {
  if (fs.existsSync(RESULTS_DIR)) {
    fs.rmSync(RESULTS_DIR, { recursive: true, force: true })
  }
  fs.mkdirSync(RESULTS_DIR, { recursive: true })
}

const readGeneratedFile = (filePath: string): string => {
  return fs.readFileSync(filePath, 'utf-8')
}

describe('generateTypeUnion', () => {
  beforeEach(() => {
    cleanupResults()
  })

  afterAll(() => {
    cleanupResults()
  })

  it('should generate union type from multiple files with Literal type', async () => {
    const outputPath = path.join(RESULTS_DIR, 'basic-union.ts')

    await generateTypeUnion({
      src: [path.join(DATA_DIR, '*.ts')],
      dst: outputPath,
      ingredients: ['Literal'],
      name: 'BasicUnion'
    })

    expect(fs.existsSync(outputPath)).toBe(true)

    const content = readGeneratedFile(outputPath)
    expect(content).toContain(
      '// This file was auto-generated. Do not edit manually.'
    )
    expect(content).toContain(
      "import type { Literal } from '../data/permissions'"
    )
    expect(content).toContain("import type { Literal } from '../data/users'")
    expect(content).toContain("import type { Literal } from '../data/actions'")
    expect(content).toContain("import type { Literal } from '../data/status'")
    expect(content).toContain('export type BasicUnion =')
    expect(content).toContain('Literal')
  })

  it('should handle nested directories with glob patterns', async () => {
    const outputPath = path.join(RESULTS_DIR, 'nested-union.ts')

    await generateTypeUnion({
      src: [path.join(DATA_DIR, '**/*.ts')],
      dst: outputPath,
      ingredients: ['Literal'],
      name: 'NestedUnion'
    })

    expect(fs.existsSync(outputPath)).toBe(true)

    const content = readGeneratedFile(outputPath)
    expect(content).toContain(
      "import type { Literal } from '../data/nested/deep'"
    )
    expect(content).toContain('export type NestedUnion =')
  })

  it('should handle multiple ingredient types', async () => {
    const outputPath = path.join(RESULTS_DIR, 'multi-ingredient.ts')

    await generateTypeUnion({
      src: [path.join(DATA_DIR, '*.ts')],
      dst: outputPath,
      ingredients: ['Literal', 'AnotherLiteral'],
      name: 'MultiIngredient'
    })

    expect(fs.existsSync(outputPath)).toBe(true)

    const content = readGeneratedFile(outputPath)
    expect(content).toContain(
      "import type { Literal, AnotherLiteral } from '../data/status'"
    )
    expect(content).toContain('export type MultiIngredient =')
    expect(content).toContain('Literal')
    expect(content).toContain('AnotherLiteral')
  })

  it('should ignore non-matching type names', async () => {
    const outputPath = path.join(RESULTS_DIR, 'filtered-union.ts')

    await generateTypeUnion({
      src: [path.join(DATA_DIR, '*.ts')],
      dst: outputPath,
      ingredients: ['NonExistentType'],
      name: 'FilteredUnion'
    })

    expect(fs.existsSync(outputPath)).toBe(false)
  })

  it('should handle single matching type', async () => {
    const outputPath = path.join(RESULTS_DIR, 'single-union.ts')

    await generateTypeUnion({
      src: [path.join(DATA_DIR, 'permissions.ts')],
      dst: outputPath,
      ingredients: ['Literal'],
      name: 'SingleUnion'
    })

    expect(fs.existsSync(outputPath)).toBe(true)

    const content = readGeneratedFile(outputPath)
    expect(content).toContain('export type SingleUnion = Literal;')
    expect(content).not.toContain('|')
  })

  it('should generate never type when no matches found', async () => {
    const outputPath = path.join(RESULTS_DIR, 'never-union.ts')

    await generateTypeUnion({
      src: [path.join(DATA_DIR, 'unrelated.ts')],
      dst: outputPath,
      ingredients: ['Literal'],
      name: 'NeverUnion'
    })

    expect(fs.existsSync(outputPath)).toBe(false)
  })

  it('should create destination directory if it does not exist', async () => {
    const deepOutputPath = path.join(RESULTS_DIR, 'deep', 'nested', 'output.ts')

    await generateTypeUnion({
      src: [path.join(DATA_DIR, 'permissions.ts')],
      dst: deepOutputPath,
      ingredients: ['Literal'],
      name: 'DeepNested'
    })

    expect(fs.existsSync(deepOutputPath)).toBe(true)
    expect(fs.existsSync(path.dirname(deepOutputPath))).toBe(true)
  })

  it('should handle relative import paths correctly', async () => {
    const outputPath = path.join(RESULTS_DIR, 'relative-imports.ts')

    await generateTypeUnion({
      src: [path.join(DATA_DIR, '**/*.ts')],
      dst: outputPath,
      ingredients: ['Literal'],
      name: 'RelativeImports'
    })

    expect(fs.existsSync(outputPath)).toBe(true)

    const content = readGeneratedFile(outputPath)
    expect(content).toContain("from '../data/permissions'")
    expect(content).toContain("from '../data/users'")
    expect(content).toContain("from '../data/actions'")
    expect(content).toContain("from '../data/status'")
    expect(content).toContain("from '../data/nested/deep'")

    expect(content).not.toContain('.ts')
    expect(content).not.toContain('.tsx')
  })

  it('should deduplicate types from same file', async () => {
    const duplicateDataPath = path.join(DATA_DIR, 'duplicate.ts')
    fs.writeFileSync(
      duplicateDataPath,
      `
export type Literal = 'duplicate-1'
export type Literal = 'duplicate-2'
    `.trim()
    )

    const outputPath = path.join(RESULTS_DIR, 'deduplicated.ts')

    await generateTypeUnion({
      src: [duplicateDataPath],
      dst: outputPath,
      ingredients: ['Literal'],
      name: 'Deduplicated'
    })

    expect(fs.existsSync(outputPath)).toBe(true)

    const content = readGeneratedFile(outputPath)
    const literalMatches = content.match(/import type { Literal }/g)
    expect(literalMatches).toHaveLength(1)

    fs.unlinkSync(duplicateDataPath)
  })
})
