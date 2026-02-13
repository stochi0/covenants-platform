import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { Chemistry, Accreditation, StateLocation } from '@/lib/filterData'
import {
  fetchChemistries,
  fetchAccreditations,
  fetchStateLocations,
  fetchTotalFacilities,
} from '@/lib/filterDataApi'

interface FilterDataContextValue {
  chemistries: Chemistry[]
  accreditations: Accreditation[]
  stateLocations: StateLocation[]
  totalFacilities: number
  isLoading: boolean
  refresh: () => Promise<void>
}

const FilterDataContext = createContext<FilterDataContextValue | null>(null)

export function FilterDataProvider({ children }: { children: ReactNode }) {
  const [chemistries, setChemistries] = useState<Chemistry[]>([])
  const [accreditations, setAccreditations] = useState<Accreditation[]>([])
  const [stateLocations, setStateLocations] = useState<StateLocation[]>([])
  const [totalFacilities, setTotalFacilities] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    const [chems, accs, locs, total] = await Promise.all([
      fetchChemistries(),
      fetchAccreditations(),
      fetchStateLocations(),
      fetchTotalFacilities(),
    ])
    setChemistries(chems)
    setAccreditations(accs)
    setStateLocations(locs)
    setTotalFacilities(total)
  }, [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    load()
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => { cancelled = true }
  }, [load])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await load()
    setIsLoading(false)
  }, [load])

  const value: FilterDataContextValue = {
    chemistries,
    accreditations,
    stateLocations,
    totalFacilities,
    isLoading,
    refresh,
  }

  return (
    <FilterDataContext.Provider value={value}>
      {children}
    </FilterDataContext.Provider>
  )
}

export function useFilterData() {
  const ctx = useContext(FilterDataContext)
  if (!ctx) {
    throw new Error('useFilterData must be used within FilterDataProvider')
  }
  return ctx
}
