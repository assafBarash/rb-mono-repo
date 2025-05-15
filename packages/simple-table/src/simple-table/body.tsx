import { useStructureProvider } from '../contexts/structure'
import { useTableProvider } from '../contexts/table'

export const TableBody = () => {
  const structure = useStructureProvider()
  const { rows, columns } = useTableProvider()
  const { Row, Cell } = structure.body

  return (
    <Row>
      {rows.map((row, idx) => (
        <Cell key={idx}>{columns.map(column => column.renderBody(row))}</Cell>
      ))}
    </Row>
  )
}
