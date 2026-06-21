import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { useAuth } from '@clerk/react'
import type { Chemistry, Accreditation, StateLocation } from '@/lib/filterData'
import {
  fetchFilterData,
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
  error: string | null
  hasLoadedData: boolean
  refresh: () => Promise<void>
}

const FilterDataContext = createContext<FilterDataContextValue | null>(null)

export function FilterDataProvider({ children }: { children: ReactNode }) {
  const { getToken, isLoaded } = useAuth()
  const [chemistries, setChemistries] = useState<Chemistry[]>([])
  const [accreditations, setAccreditations] = useState<Accreditation[]>([])
  const [stateLocations, setStateLocations] = useState<StateLocation[]>([])
  const [totalFacilities, setTotalFacilities] = useState(0)
  const [platformStats, setPlatformStats] = useState<PlatformStats>(DEFAULT_PLATFORM_STATS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasLoadedData, setHasLoadedData] = useState(false)

  const load = useCallback(async () => {
    const [filterData, stats] = await Promise.all([
      fetchFilterData(getToken),
      fetchPlatformStats(getToken),
    ])

    return { filterData, stats }
  }, [getToken])

  const applyData = useCallback((data: Awaited<ReturnType<typeof load>>) => {
    if (!data) return

    const { filterData, stats } = data
    const { chemistries: chems, accreditations: accs, stateLocations: locs, totalFacilities: total } = filterData
    const availableChemistries = chems.filter((chemistry) => chemistry.facilityCount > 0).length
    setChemistries(chems)
    setAccreditations(accs)
    setStateLocations(locs)
    setTotalFacilities(total)
    setPlatformStats({
      ...stats,
      // Keep the overview stat aligned with ChemistryFilter's "Available chemistries".
      chemistries: availableChemistries,
    })
    setError(null)
    setHasLoadedData(true)
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!isLoaded) return

    load()
      .then((data) => {
        if (!cancelled) applyData(data)
      })
      .catch((err) => {
        console.error('Error loading filter data:', err)
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load platform data.')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => { cancelled = true }
  }, [applyData, isLoaded, load])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await load()
      applyData(data)
    } catch (err) {
      console.error('Error refreshing filter data:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh platform data.')
    } finally {
      setIsLoading(false)
    }
  }, [applyData, load])

  const value: FilterDataContextValue = {
    chemistries,
    accreditations,
    stateLocations,
    totalFacilities,
    platformStats,
    isLoading,
    error,
    hasLoadedData,
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
