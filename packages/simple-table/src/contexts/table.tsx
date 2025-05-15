import { createContext, PropsWithChildren, ReactNode, useContext } from 'react'

const context = createContext({
  rows: []
})

type TableContext<Row> = {
  rows: Row[]
  columns?: Column<Row>[]
}

export const useTableProvider = <Row,>() =>
  useContext<TableContext<Row>>(context)

export const TableProvider = <Row,>({
  children,
  ...ctx
}: PropsWithChildren<TableContext<Row>>) => {
  return (
    <context.Provider value={buildContext<Row>(ctx)}>
      {children}
    </context.Provider>
  )
}

export type Column<Row> = {
  renderHead: () => ReactNode
  renderBody: (row: Row) => ReactNode
  renderFoot: (rows: Row[]) => ReactNode
}

const buildContext = <R,>(ctx: TableContext<R>): TableContext<R> => {
  const { rows, columns } = ctx
  if (columns) return ctx

  const keys = rows
    .flatMap(row => Object.keys(row))
    .filter(
      (value, index, self) => self.indexOf(value) === index
    ) as unknown as Array<keyof R>

  return {
    rows,
    columns: keys.map(
      key =>
        ({
          renderHead: () => key,
          renderBody: (row: R) => row[key],
          renderFoot: () => null
        }) as Column<R>
    )
  }
}
