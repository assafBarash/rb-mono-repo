import { BaseRow, useColumnDefaultRenderers } from '../contexts/column-render'
import { useStructureProvider } from '../contexts/structure'
import { useTableProvider } from '../contexts/table'

export const TableBody = () => {
  const structure = useStructureProvider()
  const { rows, columns } = useTableProvider()
  const { Row, Cell, Container } = structure.body
  const defaultRenderer = useColumnDefaultRenderers()

  return (
    <Container>
      {rows.map((row, idx) => (
        <Row>
          {columns.map(column => (
            <Cell key={idx}>
              {column.renderBody?.(row) ||
                defaultRenderer(column.id).renderBody(row as BaseRow)}
            </Cell>
          ))}
        </Row>
      ))}
    </Container>
  )
}
