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
import {
  fetchPlatformStats,
  type PlatformStats,
} from '@/lib/stats'

const DEFAULT_PLATFORM_STATS: PlatformStats = {
  products: 0,
  manufacturers: 0,
  chemistries: 0,
}

interface FilterDataContextValue {
  chemistries: Chemistry[]
  accreditations: Accreditation[]
  stateLocations: StateLocation[]
  totalFacilities: number
  platformStats: PlatformStats
  isLoading: boolean
  refresh: () => Promise<void>
}

const FilterDataContext = createContext<FilterDataContextValue | null>(null)

export function FilterDataProvider({ children }: { children: ReactNode }) {
  const [chemistries, setChemistries] = useState<Chemistry[]>([])
  const [accreditations, setAccreditations] = useState<Accreditation[]>([])
  const [stateLocations, setStateLocations] = useState<StateLocation[]>([])
  const [totalFacilities, setTotalFacilities] = useState(0)
  const [platformStats, setPlatformStats] = useState<PlatformStats>(DEFAULT_PLATFORM_STATS)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    const [chems, accs, locs, total, stats] = await Promise.all([
      fetchChemistries(),
      fetchAccreditations(),
      fetchStateLocations(),
      fetchTotalFacilities(),
      fetchPlatformStats(),
    ])
    setChemistries(chems)
    setAccreditations(accs)
    setStateLocations(locs)
    setTotalFacilities(total)
    setPlatformStats(stats)
  }, [])

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    platformStats,
    isLoading,
    refresh,
  }

  return (
    <FilterDataContext.Provider value={value}>
      {children}
    </FilterDataContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFilterData() {
  const ctx = useContext(FilterDataContext)
  if (!ctx) {
    throw new Error('useFilterData must be used within FilterDataProvider')
  }
  return ctx
}
