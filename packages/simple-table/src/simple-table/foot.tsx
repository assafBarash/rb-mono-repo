import { BaseRow, useColumnDefaultRenderers } from '../contexts/column-render'
import { useStructureProvider } from '../contexts/structure'
import { useTableProvider } from '../contexts/table'

export const TableFoot = () => {
  const structure = useStructureProvider()
  const { rows, columns } = useTableProvider()
  const defaultRenderer = useColumnDefaultRenderers()

  const { Row, Cell, Container } = structure.foot

  return (
    <Container>
      <Row>
        {columns.map((column, idx) => (
          <Cell key={idx}>
            {column.renderFoot?.(rows) ||
              defaultRenderer(column.id).renderFoot(rows as BaseRow[])}
          </Cell>
        ))}
      </Row>
    </Container>
  )
}
