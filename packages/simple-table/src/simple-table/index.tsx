import { Structure, StructureProvider } from '../contexts/structure'
import { TableColumn, TableProvider } from '../contexts/table'
import { DeepPartial } from '../utils/deep-partial'
import { TableHead } from './head'
import { TableBody } from './body'
import { TableFoot } from './foot'
import { TableContainer } from './container'
import {
  ColumnsDefaultRenderersProvider,
  DefaultColumnsBuilder
} from '../contexts/column-render'

export type SimpleTableProps<Row> = {
  columns?: TableColumn<Row>[]
  rows: Row[]
  structure?: DeepPartial<Structure>
  defaultColumnBuilder?: DefaultColumnsBuilder
}

export const SimpleTable = <Row,>({
  structure = {},
  rows,
  columns,
  defaultColumnBuilder
}: SimpleTableProps<Row>) => (
  <StructureProvider structure={structure}>
    <ColumnsDefaultRenderersProvider builder={defaultColumnBuilder}>
      <TableProvider rows={rows} columns={columns}>
        <TableContainer>
          <TableHead />
          <TableBody />
          <TableFoot />
        </TableContainer>
      </TableProvider>
    </ColumnsDefaultRenderersProvider>
  </StructureProvider>
)

export type FactoryProps = {
  structure?: Structure
  defaultColumnBuilder?: DefaultColumnsBuilder
}

export const createSimpleTable =
  ({ structure, defaultColumnBuilder }: FactoryProps) =>
  <Row,>(props: SimpleTableProps<Row>) => (
    <SimpleTable
      structure={structure}
      defaultColumnBuilder={defaultColumnBuilder}
      {...props}
    />
  )
