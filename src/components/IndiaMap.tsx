import { memo, useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { useFilterData } from '@/contexts/FilterDataContext'

const INDIA_GEO_JSON = '/india-states.json'

interface IndiaMapProps {
  selectedLocations?: string[]
  onLocationChange?: (locations: string[]) => void
  interactive?: boolean
  locations?: Array<{ id: string; name: string; facilityCount: number }>
}

interface HoveredState {
  id?: string
  name: string
  facilities: number
}

function getStateName(properties: Record<string, unknown>) {
  return (properties.ST_NM || properties.NAME_1 || properties.name || properties.NAME || 'Unknown') as string
}

function getFill(facilities: number, isSelected: boolean, maxFacilities: number) {
  if (isSelected) return '#0b745c'
  if (facilities <= 0 || maxFacilities <= 0) return '#ffffff'

  const ratio = Math.min(1, facilities / maxFacilities)
  const minAlpha = 0.18
  const maxAlpha = 0.88
  const alpha = minAlpha + ratio * (maxAlpha - minAlpha)
  return `rgba(11, 116, 92, ${alpha.toFixed(3)})`
}

const IndiaMapComponent = ({
  selectedLocations = [],
  onLocationChange,
  interactive = false,
  locations,
}: IndiaMapProps) => {
  const [hoveredState, setHoveredState] = useState<HoveredState | null>(null)
  const { stateLocations } = useFilterData()
  const activeLocations = locations ?? stateLocations

  const locationLookup = useMemo(() => {
    const byName = new Map<string, { id: string; name: string; facilityCount: number }>()
    for (const location of activeLocations) {
      byName.set(location.name.trim().toLowerCase(), location)
    }
    return byName
  }, [activeLocations])

  const maxFacilities = useMemo(
    () => activeLocations.reduce((max, location) => Math.max(max, location.facilityCount), 0),
    [activeLocations]
  )

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
                const isClickable = interactive && Boolean(location) && facilities > 0

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      if (facilities === 0) {
                        setHoveredState(null)
                        return
                      }
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
                        fill: getFill(facilities, isSelected, maxFacilities),
                        stroke: '#94a3b8',
                        strokeWidth: isSelected ? 2 : 1.25,
                        outline: 'none',
                        transition: 'all 0.18s ease',
                        cursor: isClickable ? 'pointer' : 'default',
                      },
                      hover: {
                        fill: getFill(facilities, isSelected, maxFacilities),
                        stroke: isClickable ? '#0b745c' : '#64748b',
                        strokeWidth: isClickable ? 2.1 : 1.4,
                        outline: 'none',
                        filter: 'brightness(0.96)',
                        cursor: isClickable ? 'pointer' : 'default',
                      },
                      pressed: {
                        fill: '#0b745c',
                        stroke: '#075746',
                        strokeWidth: 2.2,
                        outline: 'none',
                      },
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>

        <div className="absolute bottom-4 right-4 rounded-[1.4rem] border border-[#d7ece8] bg-white px-5 py-4 shadow-[0_20px_40px_-28px_rgba(15,118,110,0.28)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            State selection
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-3 w-5 rounded-md border border-[#d7ece8] bg-white" />
            <span>Not selected</span>
            <span className="ml-2 h-3 w-5 rounded-md bg-[#0b745c]" />
            <span>Selected</span>
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
