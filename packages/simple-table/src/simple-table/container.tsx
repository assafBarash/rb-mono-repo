import { PropsWithChildren } from 'react'
import { useStructureProvider } from '../contexts/structure'

export const TableContainer = ({ children }: PropsWithChildren) => {
  const { Wrapper } = useStructureProvider()
  return <Wrapper>{children}</Wrapper>
}
