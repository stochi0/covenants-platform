import { useEffect, useState } from 'react'
import { Beaker, Factory, Filter, MapPin, ShieldCheck, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  accreditationColors,
  chemistryColors,
  type FilterState,
} from '@/lib/filterData'
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
    <Card className="rounded-[1.5rem] border-primary/15 bg-white/88 shadow-[0_18px_50px_-36px_rgba(15,118,110,0.45)]">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Filter className="h-4 w-4" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground">Active filters</span>
              <Badge className="border-primary/10 bg-primary/10 text-primary">
                <Factory className="mr-1 h-3 w-3" />
                {filteredFacilityCount?.key === filterKey ? filteredFacilityCount.value : '—'}
              </Badge>
            </div>
          </div>

          <Button type="button" variant="ghost" size="sm" onClick={onClearAll} className="rounded-full">
            Clear
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedChemistries.map((chemistry) => (
            <Badge key={chemistry!.id} className={`${chemistryColors[chemistry!.category]} gap-1.5 pl-3 pr-2 py-1.5`}>
              <Beaker className="h-3 w-3" />
              {chemistry!.name}
              <button type="button" onClick={() => onChemistryRemove(chemistry!.id)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {selectedAccreditations.map((accreditation) => (
            <Badge key={accreditation!.id} className={`${accreditationColors[accreditation!.category]} gap-1.5 pl-3 pr-2 py-1.5`}>
              <ShieldCheck className="h-3 w-3" />
              {accreditation!.shortName}
              <button type="button" onClick={() => onAccreditationRemove(accreditation!.id)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {selectedLocations.map((location) => (
            <Badge key={location!.id} className="gap-1.5 border-primary/10 bg-primary/10 pl-3 pr-2 py-1.5 text-primary">
              <MapPin className="h-3 w-3" />
              {location!.name}
              <button type="button" onClick={() => onLocationRemove(location!.id)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
