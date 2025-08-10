export type ExportInfo = {
  readonly exportName: string
  readonly filePath: string
  readonly relativePath: string
}

export type ScriptOptions = {
  readonly src: readonly string[]
  readonly dst: string
  readonly ingredients: readonly string[]
  readonly name: string
  readonly verbose?: boolean
  readonly mode?: 'type' | 'const'
}

export type Context = {
  readonly dstPath: string
  readonly unionTypeName: string
  readonly verbose?: boolean
}
