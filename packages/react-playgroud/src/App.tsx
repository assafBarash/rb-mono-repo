import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow
} from '@mui/material'
import { createSimpleTable, SimpleTable } from 'simple-table'

const MuiSimpleTable = createSimpleTable({
  defaultColumnBuilder: id => ({
    id,
    renderHead: () => id.toUpperCase(),
    renderBody: row => row[id],
    renderFoot: () => null
  }),

  structure: {
    Container: Table,
    foot: {
      Container: TableFooter,
      Row: TableRow,
      Cell: TableCell
    },
    head: {
      Container: TableHead,
      Row: TableRow,
      Cell: TableCell
    },
    body: {
      Container: TableBody,
      Row: TableRow,
      Cell: TableCell
    }
  }
})

export default function App() {
  return (
    <>
      <MuiSimpleTable rows={ppl} />
      <SimpleTable
        rows={ppl}
        columns={[
          { id: 'name' },
          {
            id: 'age',
            renderFoot: rows => rows.reduce((a, b) => a + b.age, 0)
          }
        ]}
      />
    </>
  )
}

const ppl = [
  {
    name: 'John Doe',
    age: 30
  },
  {
    name: 'Jane Smith',
    age: 25
  },
  {
    name: 'Alice Johnson',
    age: 28
  },
  {
    name: 'Bob Brown',
    age: 35
  }
]
