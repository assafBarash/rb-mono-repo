import { createContext, PropsWithChildren, ReactNode, useContext } from 'react'
import deepmerge from 'deepmerge'
import { DeepPartial } from '../utils/deep-partial'

export type Structure = {
  Container: StructureComponent
  head: TableItemStructure
  body: TableItemStructure
  foot: TableItemStructure
}

type TableItemStructure = {
  Row: StructureComponent
  Cell: StructureComponent
  Container: StructureComponent
}

type StructureComponent = (props: PropsWithChildren) => ReactNode

const defaultStructure: Structure = {
  Container: ({ children }) => <table>{children}</table>,
  head: {
    Row: ({ children }) => <tr>{children}</tr>,
    Cell: ({ children }) => <th scope='col'>{children}</th>,
    Container: ({ children }) => <thead>{children}</thead>
  },
  body: {
    Row: ({ children }) => <tr>{children}</tr>,
    Cell: ({ children }) => <td>{children}</td>,
    Container: ({ children }) => <tbody>{children}</tbody>
  },
  foot: {
    Row: ({ children }) => <tr>{children}</tr>,
    Cell: ({ children }) => <td>{children}</td>,
    Container: ({ children }) => <tfoot>{children}</tfoot>
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
