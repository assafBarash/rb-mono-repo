import { useStructureProvider } from '../contexts/structure'
import { useTableProvider } from '../contexts/table'

export const TableBody = () => {
  const structure = useStructureProvider()
  const { rows, columns } = useTableProvider()
  const { Row, Cell } = structure.body

  return rows.map((row, idx) => (
    <Row>
      {columns.map(column => (
        <Cell key={idx}>{column.renderBody(row)}</Cell>
      ))}
    </Row>
  ))
}
