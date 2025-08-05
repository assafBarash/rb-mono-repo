import * as fs from 'fs'
import * as path from 'path'
import { Trait } from './service/index.js'

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

    await Trait()
      .from({
        src: [path.join(DATA_DIR, '*.ts')],
        ingredients: ['Literal']
      })
      .save({
        dst: outputPath,
        name: 'BasicUnion'
      })

    expect(fs.existsSync(outputPath)).toBe(true)

    const content = readGeneratedFile(outputPath)
    expect(content).toContain('// auto-generated::ts-literal-split')
    expect(content).toContain(
      "import type { Literal as A } from '../data/actions'"
    )
    expect(content).toContain(
      "import type { Literal as B } from '../data/permissions'"
    )
    expect(content).toContain(
      "import type { Literal as C } from '../data/status'"
    )
    expect(content).toContain(
      "import type { Literal as D } from '../data/users'"
    )
    expect(content).toContain('export type BasicUnion =')
    expect(content).toContain('| A')
    expect(content).toContain('| B')
    expect(content).toContain('| C')
    expect(content).toContain('| D')
  })

  it('should handle nested directories with glob patterns', async () => {
    const outputPath = path.join(RESULTS_DIR, 'nested-union.ts')

    await Trait()
      .from({
        src: [path.join(DATA_DIR, '**/*.ts')],
        ingredients: ['Literal']
      })
      .save({
        dst: outputPath,
        name: 'NestedUnion'
      })

    expect(fs.existsSync(outputPath)).toBe(true)

    const content = readGeneratedFile(outputPath)
    expect(content).toContain(
      "import type { Literal as B } from '../data/nested/deep'"
    )
    expect(content).toContain('export type NestedUnion =')
    expect(content).toContain('| B')
  })

  it('should handle multiple ingredient types', async () => {
    const outputPath = path.join(RESULTS_DIR, 'multi-ingredient.ts')

    await Trait()
      .from({
        src: [path.join(DATA_DIR, '*.ts')],
        ingredients: ['Literal', 'AnotherLiteral']
      })
      .save({
        dst: outputPath,
        name: 'MultiIngredient'
      })

    expect(fs.existsSync(outputPath)).toBe(true)

    const content = readGeneratedFile(outputPath)
    expect(content).toContain(
      "import type { Literal as C, AnotherLiteral as D } from '../data/status'"
    )
    expect(content).toContain('export type MultiIngredient =')
    expect(content).toContain('| E')
  })

  it('should ignore non-matching type names', async () => {
    const outputPath = path.join(RESULTS_DIR, 'filtered-union.ts')

    await Trait()
      .from({
        src: [path.join(DATA_DIR, '*.ts')],
        ingredients: ['NonExistentType']
      })
      .save({
        dst: outputPath,
        name: 'FilteredUnion'
      })

    expect(fs.existsSync(outputPath)).toBe(false)
  })

  it('should handle single matching type', async () => {
    const outputPath = path.join(RESULTS_DIR, 'single-union.ts')

    await Trait()
      .from({
        src: [path.join(DATA_DIR, 'permissions.ts')],
        ingredients: ['Literal']
      })
      .save({
        dst: outputPath,
        name: 'SingleUnion'
      })

    expect(fs.existsSync(outputPath)).toBe(true)

    const content = readGeneratedFile(outputPath)
    expect(content).toContain('export type SingleUnion = A;')
    expect(content).toContain(
      "import type { Literal as A } from '../data/permissions'"
    )
    expect(content).not.toContain('|')
  })

  it('should generate never type when no matches found', async () => {
    const outputPath = path.join(RESULTS_DIR, 'never-union.ts')

    await Trait()
      .from({
        src: [path.join(DATA_DIR, 'unrelated.ts')],
        ingredients: ['Literal']
      })
      .save({
        dst: outputPath,
        name: 'NeverUnion'
      })

    expect(fs.existsSync(outputPath)).toBe(false)
  })

  it('should create destination directory if it does not exist', async () => {
    const deepOutputPath = path.join(RESULTS_DIR, 'deep', 'nested', 'output.ts')

    await Trait()
      .from({
        src: [path.join(DATA_DIR, 'permissions.ts')],
        ingredients: ['Literal']
      })
      .save({
        dst: deepOutputPath,
        name: 'DeepNested'
      })

    expect(fs.existsSync(deepOutputPath)).toBe(true)
    expect(fs.existsSync(path.dirname(deepOutputPath))).toBe(true)
  })

  it('should handle relative import paths correctly', async () => {
    const outputPath = path.join(RESULTS_DIR, 'relative-imports.ts')

    await Trait()
      .from({
        src: [path.join(DATA_DIR, '**/*.ts')],
        ingredients: ['Literal']
      })
      .save({
        dst: outputPath,
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

    await Trait()
      .from({
        src: [duplicateDataPath],
        ingredients: ['Literal']
      })
      .save({
        dst: outputPath,
        name: 'Deduplicated'
      })

    expect(fs.existsSync(outputPath)).toBe(true)

    const content = readGeneratedFile(outputPath)
    const aliasMatches = content.match(/Literal as [A-Z]/g)
    expect(aliasMatches).toHaveLength(2)
    expect(content).toContain('export type Deduplicated = | A')
    expect(content).toContain('| B')

    fs.unlinkSync(duplicateDataPath)
  })
})
