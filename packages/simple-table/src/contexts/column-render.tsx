import { createContext, PropsWithChildren, ReactNode, useContext } from 'react'
import { Column } from './table'

export type BaseRow = Record<string, ReactNode>

export type DefaultColumnsBuilder<T = BaseRow> = (key: keyof T) => Column<T>

const defaultBuilder: DefaultColumnsBuilder = key => ({
  id: key,
  renderHead: () => key,
  renderBody: row => row[key],
  renderFoot: () => null
})

const context = createContext<DefaultColumnsBuilder>(defaultBuilder)

export const useColumnDefaultRenderers = <T = BaseRow,>() =>
  useContext(context) as DefaultColumnsBuilder<T>

export const ColumnsDefaultRenderersProvider = ({
  children,
  builder = defaultBuilder
}: PropsWithChildren<{ builder?: DefaultColumnsBuilder }>) => (
  <context.Provider value={builder}>{children}</context.Provider>
)
