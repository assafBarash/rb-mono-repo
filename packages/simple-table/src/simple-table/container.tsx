import { PropsWithChildren } from 'react'
import { useStructureProvider } from '../contexts/structure'

export const TableContainer = ({ children }: PropsWithChildren) => {
  const { Container } = useStructureProvider()
  return <Container>{children}</Container>
}
