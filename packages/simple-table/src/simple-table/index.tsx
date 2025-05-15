import { Structure, StructureProvider } from '../contexts/structure'
import { Column, TableProvider } from '../contexts/table'
import { DeepPartial } from '../utils/deep-partial'
import { TableHead } from './head'
import { TableBody } from './body'
import { TableFoot } from './foot'
import { TableContainer } from './container'

export type SimpleTableProps<Row> = {
  columns?: Column<Row>[]
  rows: Row[]
  structure?: DeepPartial<Structure>
}

export const SimpleTable = <Row,>({
  structure = {},
  rows,
  columns
}: SimpleTableProps<Row>) => (
  <StructureProvider structure={structure}>
    <TableProvider rows={rows} columns={columns}>
      <TableContainer>
        <TableHead />
        <TableBody />
        <TableFoot />
      </TableContainer>
    </TableProvider>
  </StructureProvider>
)

export const createSimpleTable =
  (structure: Structure) =>
  <Row,>(props: SimpleTableProps<Row>) => (
    <SimpleTable {...props} structure={structure} />
  )
