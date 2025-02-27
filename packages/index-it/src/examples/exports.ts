// export const exampleConstValue = 5;
export const exampleConstMethod = (p: ShouldNotExport) => {
  console.log(p);
};

// export function exampleFunction() {}
// export class ExampleClass {}

// export type ExampleType = { a: string };
// export interface Interface {
//   a: ExampleType;
// }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ShouldNotExport = { a: string };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const shouldNotExport = 5;
