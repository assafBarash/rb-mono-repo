#!/usr/bin/env node

import mri from 'mri'
import { Trait } from './service/index.js'

type CliArgs = {
  readonly src: readonly string[]
  readonly dst: string
  readonly ingredients: readonly string[]
  readonly name: string
  readonly verbose: boolean
}

const showUsage = (): void => {
  console.error(`
Usage: npm run cli -- --src "pattern1,pattern2" --dst "output.ts" --ingredients "Type1,Type2" --name "UnionType"

Options:
  --src         Comma-separated glob patterns to scan for TypeScript files
  --dst         Output file path where the generated union type will be written  
  --ingredients Comma-separated type names to search for in the scanned files
  --name        Name for the generated union type
  --verbose     Enable verbose logging output
  --help        Show this help message

Examples:
  npm run cli -- --src "src/**/*.ts,lib/**/*.ts" --dst "src/generated/union.ts" --ingredients "PermissionLiteral,UserRole" --name "AllPermissions" --verbose
  npm run cli -- --src "*.ts" --dst "output.ts" --ingredients "MyType" --name "Combined"
  `)
}

const validateRequiredArgs = (parsed: Record<string, unknown>): void => {
  const { src, dst, ingredients, name } = parsed

  if (!src || !dst || !ingredients || !name) {
    console.error(
      'Error: All arguments (--src, --dst, --ingredients, --name) are required\n'
    )
    showUsage()
    process.exit(1)
  }
}

const parseStringArray = (value: unknown): readonly string[] => {
  return typeof value === 'string' ? value.split(',').map(s => s.trim()) : []
}

const validateArrays = (
  srcArray: readonly string[],
  ingredientsArray: readonly string[]
): void => {
  if (srcArray.length === 0 || ingredientsArray.length === 0) {
    console.error(
      'Error: --src and --ingredients must contain at least one item\n'
    )
    showUsage()
    process.exit(1)
  }
}

const parseArgs = (): CliArgs => {
  const parsed = mri(process.argv.slice(2), {
    alias: {
      s: 'src',
      d: 'dst',
      i: 'ingredients',
      n: 'name',
      v: 'verbose',
      h: 'help'
    }
  })

  if (parsed.help) {
    showUsage()
    process.exit(0)
  }

  validateRequiredArgs(parsed)

  const { src, dst, ingredients, name, verbose } = parsed
  const srcArray = parseStringArray(src)
  const ingredientsArray = parseStringArray(ingredients)

  validateArrays(srcArray, ingredientsArray)

  return {
    src: srcArray,
    dst: String(dst),
    ingredients: ingredientsArray,
    name: String(name),
    verbose: Boolean(verbose)
  }
}

const runCli = async (): Promise<void> => {
  try {
    const options = parseArgs()

    await Trait({ verbose: options.verbose })
      .from({
        src: options.src,
        ingredients: options.ingredients
      })
      .save({
        dst: options.dst,
        name: options.name
      })
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

runCli()
