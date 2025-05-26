import { CurryOn } from 'curry-on'

type AnyFn = (...args: any[]) => any

type InputMiddleware<F extends AnyFn> = (
  ...args: Parameters<F>
) => Parameters<F>
type OutputMiddleware<F extends AnyFn> = (
  result: Awaited<ReturnType<F>>
) => Awaited<ReturnType<F>>

type MethodGetter<Service, F extends AnyFn> = (service: Service) => F

// Deep clone + override at path (non-mutative)
const deepOverride = <T, V>(
  obj: T,
  path: string[],
  fn: (original: any) => V
): T => {
  if (path.length === 0) return obj

  const [head, ...rest] = path
  const value = (obj as any)[head]

  const newValue = rest.length === 0 ? fn(value) : deepOverride(value, rest, fn)

  return {
    ...(obj as any),
    [head]: newValue
  }
}

// Get property path as string[] from a getter function
function extractPath<T extends Record<string, any>, R>(
  getter: (obj: T) => R
): string[] {
  const path: string[] = []

  const proxy = new Proxy(
    {},
    {
      get(_, prop) {
        path.push(String(prop))
        return proxy
      }
    }
  )

  getter(proxy as any) // populate path
  return path
}

export const MidHell = <Service extends Record<string, any>>(
  service: Service
) => {
  const mutateInput = <F extends AnyFn>(
    getter: MethodGetter<Service, F>,
    input: InputMiddleware<F>
  ) => {
    const path = extractPath(getter)
    const newService = deepOverride(service, path, orig =>
      CurryOn(orig).mapInput(input)
    )
    return MidHell(newService)
  }

  const mutateOutput = <F extends AnyFn>(
    getter: MethodGetter<Service, F>,
    output: OutputMiddleware<F>
  ) => {
    const path = extractPath(getter)
    const newService = deepOverride(service, path, orig =>
      CurryOn(orig).mapOutput(output)
    )
    return MidHell(newService)
  }

  const build = (): Service => service

  return { mutateInput, mutateOutput, build }
}
