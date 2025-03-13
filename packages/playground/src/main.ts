/* eslint-disable @typescript-eslint/no-explicit-any */
export function pipe<
  T,
  Fns extends [(arg: T) => any, ...Array<(arg: any) => any>]
>(value: T, ...fns: Fns): PipeResult<T, Fns> {
  return fns.reduce((acc, fn) => fn(acc), value) as PipeResult<T, Fns>;
}

// 🔥 Recursively infer the final return type
type PipeResult<T, Fns extends Array<(arg: any) => any>> = Fns extends [
  (arg: infer A) => infer B,
  ...infer Rest
]
  ? Rest extends Array<(arg: any) => any>
    ? PipeResult<B, Rest>
    : B
  : T;

export const main = async () => {
  pipe(
    1,
    (x) => x.toString(),
    (v) => v // now v is any though it should be string;
  );
  return { name: 'John', age: 42 };
};
