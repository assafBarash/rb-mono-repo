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

export type Context = {
  readonly dstPath: string
  readonly unionTypeName: string
  readonly verbose?: boolean
}
