import { createContext, PropsWithChildren, ReactNode, useContext } from 'react'
import deepmerge from 'deepmerge'
import { DeepPartial } from '../utils/deep-partial'

export type Structure = {
  Wrapper: StructureComponent
  head: TableItemStructure
  body: TableItemStructure
  foot: TableItemStructure
}

type TableItemStructure = {
  Row: StructureComponent
  Cell: StructureComponent
}

type StructureComponent = (props: PropsWithChildren) => ReactNode

const defaultStructure: Structure = {
  Wrapper: ({ children }) => <table>{children}</table>,
  head: {
    Row: ({ children }) => <tr>{children}</tr>,
    Cell: ({ children }) => <th scope='col'>{children}</th>
  },
  body: {
    Row: ({ children }) => <tr>{children}</tr>,
    Cell: ({ children }) => <td>{children}</td>
  },
  foot: {
    Row: ({ children }) => <tr>{children}</tr>,
    Cell: ({ children }) => <td>{children}</td>
  }
}

const context = createContext<Structure>(defaultStructure)

export const useStructureProvider = () => useContext(context)

export const StructureProvider = ({
  children,
  structure
}: PropsWithChildren<{ structure: DeepPartial<Structure> }>) => (
  <context.Provider value={deepmerge(defaultStructure, structure) as Structure}>
    {children}
  </context.Provider>
)
