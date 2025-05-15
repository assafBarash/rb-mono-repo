import { useStructureProvider } from '../contexts/structure'
import { useTableProvider } from '../contexts/table'

export const TableFoot = () => {
  const structure = useStructureProvider()
  const { rows, columns } = useTableProvider()
  const { Row, Cell } = structure.foot

  return (
    <Row>
      {columns.map((column, idx) => (
        <Cell key={idx}>{column.renderFoot(rows)}</Cell>
      ))}
    </Row>
  )
}
