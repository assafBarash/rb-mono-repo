import { createContext, PropsWithChildren, ReactNode, useContext } from 'react'
import { useColumnDefaultRenderers } from './column-render'

const context = createContext({
  rows: []
})

export type TableColumn<Row> = Pick<Column<Row>, 'id'> &
  Partial<Omit<Column<Row>, 'id'>>

type TableContext<Row> = {
  rows: Row[]
  columns?: TableColumn<Row>[]
}

export const useTableProvider = <Row,>() =>
  useContext<TableContext<Row>>(context)

export const TableProvider = <Row,>({
  children,
  ...props
}: PropsWithChildren<TableContext<Row>>) => {
  const ctx = useBuildContext<Row>(props)
  return <context.Provider value={ctx}>{children}</context.Provider>
}

export type Column<Row> = {
  id: string
  renderHead: () => ReactNode
  renderBody: (row: Row) => ReactNode
  renderFoot: (rows: Row[]) => ReactNode
}

const useBuildContext = <R,>(ctx: TableContext<R>): TableContext<R> => {
  const defaultRenderer = useColumnDefaultRenderers<R>()
  const { rows, columns } = ctx
  if (columns) return ctx

  const keys = rows
    .flatMap(row => Object.keys(row))
    .filter(
      (value, index, self) => self.indexOf(value) === index
    ) as unknown as Array<keyof R>

  return {
    rows,
    columns: keys.map(defaultRenderer)
  }
}
