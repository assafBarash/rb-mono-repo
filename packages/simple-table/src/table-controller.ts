import { useTableProvider } from './contexts/table'

export type TableController = ReturnType<typeof useTableController>

export const useTableController = () => {
  const { expendedStore } = useTableProvider()

  return {
    expendedStore
  }
}
