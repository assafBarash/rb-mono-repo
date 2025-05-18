import { createContext, PropsWithChildren, useContext, useState } from 'react'
import { Column, useColumnDefaultRenderers } from './column-render'

const context = createContext({
  rows: []
})

export type TableColumn<Row> = Pick<Column<Row>, 'id'> &
  Partial<Omit<Column<Row>, 'id'>>

type PublicTableContext<Row> = {
  rows: Row[]
  columns?: TableColumn<Row>[]
}

type PrivateTableContext<Row> = PublicTableContext<Row> & {
  expendedStore: ExpendedRowsStore
}

export const useTableProvider = <Row,>() =>
  useContext<PrivateTableContext<Row>>(context)

export const TableProvider = <Row,>({
  children,
  ...props
}: PropsWithChildren<PublicTableContext<Row>>) => {
  const ctx = useBuildContext<Row>(props)
  return <context.Provider value={ctx}>{children}</context.Provider>
}

const useBuildContext = <R,>(
  ctx: PublicTableContext<R>
): PrivateTableContext<R> => {
  const defaultRenderer = useColumnDefaultRenderers<R>()
  const expendedStore = useExpendedRowsStore()
  const { rows, columns } = ctx

  const keys = rows
    .flatMap(row => Object.keys(row))
    .filter(
      (value, index, self) => self.indexOf(value) === index
    ) as unknown as Array<keyof R>

  return {
    rows,
    columns: columns || keys.map(defaultRenderer),
    expendedStore
  }
}

type ExpendedRowsStore = {
  rowsIndexes: number[]
  setRowsIndexes: (indexes: number[]) => void
}

const useExpendedRowsStore = (): ExpendedRowsStore => {
  const [rowsIndexes, setRowsIndexes] = useState<number[]>([])
  return { rowsIndexes, setRowsIndexes }
}
