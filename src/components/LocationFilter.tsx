import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/react'
import { Check, MapPin, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useFilterData } from '@/contexts/FilterDataContext'
import { fetchStateFacilityCountsByFilters } from '@/lib/filterDataApi'
import { IndiaMap } from './IndiaMap'

interface LocationFilterProps {
  selectedLocations: string[]
  selectedChemistries: string[]
  selectedAccreditations: string[]
  onSelectionChange: (selected: string[]) => void
}

export function LocationFilter({
  selectedLocations,
  selectedChemistries,
  selectedAccreditations,
  onSelectionChange,
}: LocationFilterProps) {
  const { getToken } = useAuth()
  const { stateLocations, totalFacilities, isLoading, error, hasLoadedData } = useFilterData()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCounts, setFilteredCounts] = useState<{ key: string; byLocation: Map<string, number> } | null>(
    null
  )
  const [filteredCountError, setFilteredCountError] = useState<{ key: string; message: string } | null>(null)

  const mapFilterKey = useMemo(
    () => `${selectedChemistries.join('|')}::${selectedAccreditations.join('|')}`,
    [selectedChemistries, selectedAccreditations]
  )
  const hasCapabilityFilters = selectedChemistries.length > 0 || selectedAccreditations.length > 0

  useEffect(() => {
    if (!hasCapabilityFilters) return

    let cancelled = false
    fetchStateFacilityCountsByFilters(getToken, {
      chemistries: selectedChemistries,
      accreditations: selectedAccreditations,
    })
      .then((rows) => {
        if (cancelled) return
        const byLocation = new Map<string, number>()
        for (const row of rows) byLocation.set(row.locationId, row.facilityCount)
        setFilteredCounts({ key: mapFilterKey, byLocation })
      })
      .catch((err) => {
        console.error('Error fetching filtered state counts:', err)
        if (!cancelled) {
          setFilteredCountError({
            key: mapFilterKey,
            message: err instanceof Error ? err.message : 'Failed to load matching facilities.',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [getToken, hasCapabilityFilters, mapFilterKey, selectedAccreditations, selectedChemistries])

  const mapLocations = useMemo(() => {
    // Start from capability-filtered counts if present; otherwise baseline counts.
    const base = hasCapabilityFilters
      ? (() => {
          const counts = filteredCounts?.key === mapFilterKey ? filteredCounts.byLocation : null
          if (!counts) return stateLocations
          return stateLocations.map((location) => ({
            ...location,
            facilityCount: counts.get(location.id) ?? 0,
          }))
        })()
      : stateLocations

    // Keep all states clickable so users can build a multi-select.
    return base
  }, [filteredCounts, hasCapabilityFilters, mapFilterKey, stateLocations])

  const selectedLocationObjects = useMemo(
    () => stateLocations.filter((location) => selectedLocations.includes(location.id)),
    [selectedLocations, stateLocations]
  )

  const visibleLocations = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    const base = normalized
      ? mapLocations.filter((location) => location.facilityCount > 0 && location.name.toLowerCase().includes(normalized))
      : mapLocations.filter((location) => location.facilityCount > 0)

    return [...base].sort((a, b) => b.facilityCount - a.facilityCount || a.name.localeCompare(b.name))
  }, [searchQuery, mapLocations])

  const selectedFacilityCount = selectedLocationObjects.reduce(
    (sum, location) => sum + location.facilityCount,
    0
  )

  const matchingFacilities = useMemo(() => {
    if (hasCapabilityFilters && filteredCounts?.key !== mapFilterKey) return null
    let total = 0
    for (const location of mapLocations) total += location.facilityCount
    return total
  }, [filteredCounts, hasCapabilityFilters, mapFilterKey, mapLocations])
  const currentFilteredCountError = filteredCountError?.key === mapFilterKey ? filteredCountError : null

  const toggleLocation = (locationId: string) => {
    onSelectionChange(
      selectedLocations.includes(locationId)
        ? selectedLocations.filter((id) => id !== locationId)
        : [...selectedLocations, locationId]
    )
  }

  if (isLoading && !hasLoadedData) {
    return (
      <Card className="rounded-[1.75rem] border-[#d7ece8] bg-white/90">
        <CardContent className="flex min-h-[420px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/15 border-t-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error && !hasLoadedData) {
    return (
      <Card className="rounded-[1.75rem] border-[#d7ece8] bg-white/90">
        <CardContent className="flex min-h-[260px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
          Location data is unavailable right now.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-[1.75rem] border-[#d7ece8] bg-white/88 shadow-[0_30px_80px_-56px_rgba(15,118,110,0.45)]">
      <CardHeader className="space-y-4 px-5 pb-0 pt-5 sm:px-6 sm:pt-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="h-5 w-5 text-primary" />
              Locations
            </CardTitle>
          </div>

          {selectedLocations.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelectionChange([])}
              className="rounded-full border-[#d7ece8] bg-white"
            >
              Clear states
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-primary/10 bg-primary/10 px-3 py-1.5 text-primary">
            {totalFacilities.toLocaleString()} facilities
          </Badge>
          {(hasCapabilityFilters || selectedLocations.length > 0) && (
            <Badge className="border-[#d7ece8] bg-white px-3 py-1.5 text-foreground">
              {currentFilteredCountError
                ? 'Matching unavailable'
                : matchingFacilities === null
                ? 'Loading matching'
                : `${matchingFacilities.toLocaleString()} matching`}
            </Badge>
          )}
          {selectedLocations.length > 0 && (
            <Badge className="border-[#d7ece8] bg-white px-3 py-1.5 text-foreground">
              {selectedLocations.length} states selected
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
        <IndiaMap
          interactive
          selectedLocations={selectedLocations}
          onLocationChange={onSelectionChange}
          locations={mapLocations}
        />

        {currentFilteredCountError && (
          <div className="rounded-[1rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Matching location counts are unavailable. Showing the last loaded map data.
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search states"
                className="h-12 rounded-[1rem] border-[#d7ece8] bg-white pl-10"
              />
            </div>

            <ScrollArea className="h-[340px] pr-4">
              <div className="space-y-2.5">
                {visibleLocations.map((location) => {
                  const isSelected = selectedLocations.includes(location.id)
                  return (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() => toggleLocation(location.id)}
                      className={`flex w-full items-center justify-between rounded-[1.1rem] border px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? 'border-primary/25 bg-primary/[0.06]'
                          : 'border-[#d7ece8] bg-white hover:border-primary/20'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-[#d7ece8] bg-[#f3fbfa] text-transparent'
                        }`}>
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="truncate text-sm font-medium text-foreground">
                          {location.name}
                        </span>
                      </div>

                      <span className="text-sm font-medium text-muted-foreground">
                        {location.facilityCount.toLocaleString()}
                      </span>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="rounded-[1.5rem] border border-[#d7ece8] bg-[linear-gradient(180deg,rgba(248,252,252,0.95),rgba(255,255,255,0.95))] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">Selected states</p>
              <span className="text-sm font-medium text-muted-foreground">
                {selectedFacilityCount.toLocaleString()} facilities
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {selectedLocationObjects.length > 0 ? (
                selectedLocationObjects.map((location) => (
                  <Badge
                    key={location.id}
                    className="gap-1.5 border-[#d7ece8] bg-white px-3 py-1.5 text-foreground"
                  >
                    {location.name}
                    <button type="button" onClick={() => toggleLocation(location.id)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <div className="rounded-[1rem] border border-dashed border-[#d7ece8] bg-white/80 px-4 py-6 text-sm text-muted-foreground">
                  Pick states from the map or the list.
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
