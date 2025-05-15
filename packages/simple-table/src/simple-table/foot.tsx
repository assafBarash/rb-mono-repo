import { useStructureProvider } from '../contexts/structure'
import { useTableProvider } from '../contexts/table'

export const TableFoot = () => {
  const structure = useStructureProvider()
  const { rows, columns } = useTableProvider()
  const { Row, Cell, Container } = structure.foot

  return (
    <Container>
      <Row>
        {columns.map((column, idx) => (
          <Cell key={idx}>{column.renderFoot(rows)}</Cell>
        ))}
      </Row>
    </Container>
  )
}
