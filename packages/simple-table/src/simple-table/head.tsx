import { useStructureProvider } from '../contexts/structure'
import { useTableProvider } from '../contexts/table'

export const TableHead = () => {
  const structure = useStructureProvider()
  const { columns } = useTableProvider()
  const { Row, Cell, Container } = structure.head

  return (
    <Container>
      <Row>
        {columns.map((column, idx) => (
          <Cell key={idx}>{column.renderHead()}</Cell>
        ))}
      </Row>
    </Container>
  )
}
