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

type ShouldNotExport = { a: string };
