export type DeepPartial<T> = T extends (...args: any) => any
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T
