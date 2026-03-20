import { memo, useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { MapPinned } from 'lucide-react'
import { useFilterData } from '@/contexts/FilterDataContext'

const INDIA_GEO_JSON = '/india-states.json'

interface IndiaMapProps {
  selectedLocations?: string[]
  onLocationChange?: (locations: string[]) => void
  interactive?: boolean
}

interface HoveredState {
  id?: string
  name: string
  facilities: number
}

function getStateName(properties: Record<string, unknown>) {
  return (properties.ST_NM || properties.NAME_1 || properties.name || properties.NAME || 'Unknown') as string
}

function getFill(facilities: number, isSelected: boolean) {
  if (isSelected) return '#0f766e'
  if (facilities >= 12) return '#0f766e'
  if (facilities >= 7) return '#14877f'
  if (facilities >= 3) return '#31a39a'
  if (facilities >= 1) return '#95d8d2'
  return '#e4f3f2'
}

const IndiaMapComponent = ({
  selectedLocations = [],
  onLocationChange,
  interactive = false,
}: IndiaMapProps) => {
  const [hoveredState, setHoveredState] = useState<HoveredState | null>(null)
  const { stateLocations } = useFilterData()

  const locationLookup = useMemo(() => {
    const byName = new Map<string, { id: string; name: string; facilityCount: number }>()
    for (const location of stateLocations) {
      byName.set(location.name.trim().toLowerCase(), location)
    }
    return byName
  }, [stateLocations])

  const selectedFacilityCount = useMemo(() => {
    if (selectedLocations.length === 0) return 0
    return stateLocations
      .filter((location) => selectedLocations.includes(location.id))
      .reduce((sum, location) => sum + location.facilityCount, 0)
  }, [selectedLocations, stateLocations])

  const selectedStateCount = selectedLocations.length

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-[#d7ece8] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(239,249,247,0.92))] p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 border-b border-[#deece9] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            India footprint
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            Explore facility coverage across India
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Every state on this map is linked to the live `regions` and `facilities` tables in Supabase.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#d7ece8] bg-white/90 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Selected states
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{selectedStateCount}</p>
          </div>
          <div className="rounded-2xl border border-[#d7ece8] bg-white/90 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Selected facilities
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {selectedFacilityCount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 1000, center: [82.5, 22.3] }}
          style={{ width: '100%', height: '100%', maxHeight: '560px' }}
        >
          <Geographies geography={INDIA_GEO_JSON}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName = getStateName(geo.properties)
                const location = locationLookup.get(stateName.trim().toLowerCase())
                const facilities = location?.facilityCount ?? 0
                const isSelected = location ? selectedLocations.includes(location.id) : false
                const isClickable = interactive && Boolean(location)

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      setHoveredState({
                        id: location?.id,
                        name: stateName,
                        facilities,
                      })
                    }}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => {
                      if (!isClickable || !location || !onLocationChange) return
                      onLocationChange(
                        isSelected
                          ? selectedLocations.filter((id) => id !== location.id)
                          : [...selectedLocations, location.id]
                      )
                    }}
                    style={{
                      default: {
                        fill: getFill(facilities, isSelected),
                        stroke: '#ffffff',
                        strokeWidth: isSelected ? 1.8 : 0.9,
                        outline: 'none',
                        transition: 'all 0.18s ease',
                        cursor: isClickable ? 'pointer' : 'default',
                      },
                      hover: {
                        fill: getFill(facilities, isSelected),
                        stroke: isClickable ? '#0f766e' : '#ffffff',
                        strokeWidth: isClickable ? 1.8 : 1,
                        outline: 'none',
                        filter: 'brightness(0.96)',
                        cursor: isClickable ? 'pointer' : 'default',
                      },
                      pressed: {
                        fill: '#0f766e',
                        stroke: '#0b5f59',
                        strokeWidth: 2,
                        outline: 'none',
                      },
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>

        <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-[#d7ece8] bg-white/92 px-3 py-2 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
            <MapPinned className="h-3.5 w-3.5 text-primary" />
            {interactive ? 'Click any active state to filter' : 'Live facility concentration'}
          </div>
        </div>

        <div className="absolute bottom-4 right-4 rounded-2xl border border-[#d7ece8] bg-white/92 px-3 py-3 shadow-sm backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Facility density
          </p>
          <div className="mt-2 flex items-center gap-2">
            {['#e4f3f2', '#95d8d2', '#31a39a', '#14877f', '#0f766e'].map((color) => (
              <span
                key={color}
                className="h-3 w-7 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {hoveredState && (
          <div className="pointer-events-none absolute bottom-4 left-4 max-w-[240px] rounded-2xl border border-[#d7ece8] bg-white/96 px-4 py-3 shadow-sm backdrop-blur">
            <p className="text-sm font-semibold text-foreground">{hoveredState.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {hoveredState.facilities.toLocaleString()} facility{hoveredState.facilities === 1 ? '' : 'ies'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export const IndiaMap = memo(IndiaMapComponent)
