import { useEffect, useState } from 'react'
import { Beaker, MapPin, ShieldCheck, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { FilterState } from '@/lib/filterData'
import { fetchFacilityCountByFilters } from '@/lib/filterDataApi'
import { useFilterData } from '@/contexts/FilterDataContext'

interface FilterSummaryProps {
  filters: FilterState
  onChemistryRemove: (id: string) => void
  onAccreditationRemove: (id: string) => void
  onLocationRemove: (id: string) => void
  onClearAll: () => void
}

export function FilterSummary({
  filters,
  onChemistryRemove,
  onAccreditationRemove,
  onLocationRemove,
  onClearAll,
}: FilterSummaryProps) {
  const { chemistries, accreditations, stateLocations } = useFilterData()
  const [filteredFacilityCount, setFilteredFacilityCount] = useState<{ key: string; value: number } | null>(null)

  const hasFilters = filters.chemistries.length > 0
    || filters.accreditations.length > 0
    || filters.locations.length > 0

  const filterKey = [
    filters.chemistries.join('|'),
    filters.accreditations.join('|'),
    filters.locations.join('|'),
  ].join('::')

  useEffect(() => {
    if (!hasFilters) return

    let cancelled = false
    fetchFacilityCountByFilters(filters)
      .then((count) => {
        if (!cancelled) setFilteredFacilityCount({ key: filterKey, value: count })
      })
      .catch(() => {
        if (!cancelled) setFilteredFacilityCount({ key: filterKey, value: 0 })
      })

    return () => {
      cancelled = true
    }
  }, [filterKey, filters, hasFilters])

  if (!hasFilters) return null

  const selectedChemistries = filters.chemistries
    .map((id) => chemistries.find((chemistry) => chemistry.id === id))
    .filter(Boolean)

  const selectedAccreditations = filters.accreditations
    .map((id) => accreditations.find((accreditation) => accreditation.id === id))
    .filter(Boolean)

  const selectedLocations = filters.locations
    .map((id) => stateLocations.find((location) => location.id === id))
    .filter(Boolean)

  return (
    <Card className="rounded-[1.5rem] border-[#d7ece8] bg-white/92 shadow-[0_24px_60px_-48px_rgba(15,118,110,0.32)]">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-primary/10 bg-primary/10 px-3 py-1.5 text-primary">
              {(filteredFacilityCount?.key === filterKey ? filteredFacilityCount.value : 0).toLocaleString()} facilities
            </Badge>
            <Badge className="border-[#d7ece8] bg-white px-3 py-1.5 text-foreground">
              {[
                filters.locations.length,
                filters.chemistries.length,
                filters.accreditations.length,
              ].reduce((sum, value) => sum + value, 0)} selected
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClearAll} className="rounded-full border-[#d7ece8] bg-white">
              Clear all
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedLocations.map((location) => (
            <Badge key={location!.id} className="gap-1.5 border-[#d7ece8] bg-[#f3fbfa] px-3 py-1.5 text-foreground">
              <MapPin className="h-3 w-3" />
              {location!.name}
              <button type="button" onClick={() => onLocationRemove(location!.id)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {selectedChemistries.map((chemistry) => (
            <Badge key={chemistry!.id} className="gap-1.5 border-[#d7ece8] bg-[#f3fbfa] px-3 py-1.5 text-foreground">
              <Beaker className="h-3 w-3" />
              {chemistry!.name}
              <button type="button" onClick={() => onChemistryRemove(chemistry!.id)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {selectedAccreditations.map((accreditation) => (
            <Badge key={accreditation!.id} className="gap-1.5 border-[#d7ece8] bg-[#f3fbfa] px-3 py-1.5 text-foreground">
              <ShieldCheck className="h-3 w-3" />
              {accreditation!.shortName}
              <button type="button" onClick={() => onAccreditationRemove(accreditation!.id)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
