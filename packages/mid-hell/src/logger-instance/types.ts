export type ILogger = {
  readonly log: (...args: unknown[]) => void
  readonly warn: (...args: unknown[]) => void
}

export type LoggerContext = {
  readonly logger: ILogger
  readonly dstPath: string
}
