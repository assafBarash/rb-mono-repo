import { BaseRow, useColumnDefaultRenderers } from '../contexts/column-render'
import { useStructureProvider } from '../contexts/structure'
import { useTableProvider } from '../contexts/table'
import { useTableController } from '../table-controller'

export const TableBody = () => {
  const structure = useStructureProvider()
  const { rows, columns } = useTableProvider()
  const { Row, Cell, Container } = structure.body
  const defaultRenderer = useColumnDefaultRenderers()
  const tableController = useTableController()

  return (
    <Container>
      {rows.map((row, idx) => (
        <Row>
          {columns.map(column => (
            <Cell key={idx}>
              {column.renderBody?.(row, tableController) ||
                defaultRenderer(column.id).renderBody(
                  row as BaseRow,
                  tableController
                )}
            </Cell>
          ))}
        </Row>
      ))}
    </Container>
  )
}
