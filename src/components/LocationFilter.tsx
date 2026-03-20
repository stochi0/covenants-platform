import { useMemo, useState } from 'react'
import { Check, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useFilterData } from '@/contexts/FilterDataContext'

interface LocationFilterProps {
  selectedLocations: string[]
  onSelectionChange: (selected: string[]) => void
}

export function LocationFilter({
  selectedLocations,
  onSelectionChange,
}: LocationFilterProps) {
  const { stateLocations, totalFacilities, isLoading } = useFilterData()
  const [searchQuery, setSearchQuery] = useState('')

  const visibleLocations = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    const filtered = normalized
      ? stateLocations.filter((location) => location.name.toLowerCase().includes(normalized))
      : stateLocations

    return [...filtered].sort((a, b) => b.facilityCount - a.facilityCount || a.name.localeCompare(b.name))
  }, [searchQuery, stateLocations])

  const topLocations = visibleLocations.slice(0, 5)

  const selectedFacilityCount = selectedLocations.length > 0
    ? stateLocations
        .filter((location) => selectedLocations.includes(location.id))
        .reduce((sum, location) => sum + location.facilityCount, 0)
    : totalFacilities

  const toggleLocation = (locationId: string) => {
    if (selectedLocations.includes(locationId)) {
      onSelectionChange(selectedLocations.filter((id) => id !== locationId))
      return
    }

    onSelectionChange([...selectedLocations, locationId])
  }

  if (isLoading) {
    return (
      <Card className="rounded-[1.5rem] border-white/70 bg-white/85">
        <CardContent className="flex min-h-[360px] items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-[1.5rem] border-white/70 bg-white/85 shadow-[0_18px_50px_-36px_rgba(15,118,110,0.45)]">
      <CardHeader className="space-y-4 px-5 pb-0 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-4 w-4 text-primary" />
              Locations
            </CardTitle>
          </div>
          {selectedLocations.length > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onSelectionChange([])} className="rounded-full">
              Clear
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[1.1rem] border border-primary/10 bg-primary/[0.06] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Scope
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {selectedFacilityCount.toLocaleString()}
            </p>
          </div>
          <div className="rounded-[1.1rem] border border-border/70 bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Selected
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {selectedLocations.length || stateLocations.length}
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search locations"
            className="h-11 rounded-[1rem] border-border/70 bg-white pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {topLocations.map((location) => {
            const isSelected = selectedLocations.includes(location.id)
            return (
              <button
                key={location.id}
                type="button"
                onClick={() => toggleLocation(location.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border/70 bg-white text-foreground hover:border-primary/20'
                }`}
              >
                {location.name}
              </button>
            )
          })}
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-5">
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
                      ? 'border-primary/30 bg-primary/[0.06]'
                      : 'border-border/70 bg-white hover:border-primary/20'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-muted text-transparent'
                    }`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="truncate text-sm font-medium text-foreground">
                      {location.name}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
