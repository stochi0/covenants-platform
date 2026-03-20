import { memo, useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
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
  if (isSelected) return '#0b745c'
  if (facilities >= 12) return '#1b7c69'
  if (facilities >= 7) return '#38a596'
  if (facilities >= 3) return '#5fbe8c'
  if (facilities >= 1) return '#9bd7b0'
  return '#d9f0e0'
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
    <div className="relative overflow-hidden rounded-[1.75rem] border border-[#d7ece8] bg-white p-3 shadow-[0_24px_60px_-48px_rgba(15,118,110,0.28)] sm:p-4">
      <div className="relative min-h-[520px]">
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
                        stroke: isClickable ? '#0b745c' : '#ffffff',
                        strokeWidth: isClickable ? 1.8 : 1,
                        outline: 'none',
                        filter: 'brightness(0.96)',
                        cursor: isClickable ? 'pointer' : 'default',
                      },
                      pressed: {
                        fill: '#0b745c',
                        stroke: '#075746',
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

        <div className="absolute left-4 top-4 rounded-[1.35rem] bg-[#0b745c] px-5 py-4 text-white shadow-[0_18px_40px_-24px_rgba(11,116,92,0.75)]">
          <p className="text-sm font-medium text-white/90">
            {selectedStateCount > 0 ? 'Selected Facilities' : 'Total Facilities'}
          </p>
          <p className="mt-1 text-4xl font-semibold tracking-tight">
            {(selectedStateCount > 0 ? selectedFacilityCount : stateLocations.reduce((sum, location) => sum + location.facilityCount, 0)).toLocaleString()}
          </p>
        </div>

        <div className="absolute bottom-4 right-4 rounded-[1.4rem] border border-[#d7ece8] bg-white px-5 py-4 shadow-[0_20px_40px_-28px_rgba(15,118,110,0.28)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Facilities
          </p>
          <div className="mt-2 flex items-center gap-2">
            {['#d9f0e0', '#9bd7b0', '#5fbe8c', '#38a596', '#1b7c69'].map((color) => (
              <span
                key={color}
                className="h-3 w-5 rounded-md"
                style={{ backgroundColor: color }}
              />
            ))}
            <span className="ml-1 text-sm text-muted-foreground">High</span>
          </div>
          {interactive && (
            <p className="mt-3 border-t border-[#e8f1ef] pt-3 text-sm text-muted-foreground">
              Click states to filter
            </p>
          )}
        </div>

        {hoveredState && (
          <div className="pointer-events-none absolute bottom-4 left-4 max-w-[240px] rounded-[1.2rem] border border-[#d7ece8] bg-white/96 px-4 py-3 shadow-sm backdrop-blur">
            <p className="text-sm font-semibold text-foreground">{hoveredState.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {hoveredState.facilities.toLocaleString()} {hoveredState.facilities === 1 ? 'facility' : 'facilities'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export const IndiaMap = memo(IndiaMapComponent)
