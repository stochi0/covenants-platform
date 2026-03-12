import { useEffect, useMemo, useState } from 'react'
import { Check, Search, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  accreditationCategories,
  accreditationColors,
  type Accreditation,
} from '@/lib/filterData'
import { fetchFacilityCountByAccreditations } from '@/lib/filterDataApi'
import { useFilterData } from '@/contexts/FilterDataContext'

interface AccreditationFilterProps {
  selectedAccreditations: string[]
  onSelectionChange: (selected: string[]) => void
}

export function AccreditationFilter({
  selectedAccreditations,
  onSelectionChange,
}: AccreditationFilterProps) {
  const { accreditations, totalFacilities, isLoading } = useFilterData()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<Accreditation['category'] | 'all'>('all')
  const [selectedFacilityCount, setSelectedFacilityCount] = useState<{ key: string; value: number } | null>(null)

  const selectedKey = selectedAccreditations.join('|')

  useEffect(() => {
    if (!selectedKey) return

    let cancelled = false
    fetchFacilityCountByAccreditations(selectedAccreditations)
      .then((count) => {
        if (!cancelled) setSelectedFacilityCount({ key: selectedKey, value: count })
      })
      .catch(() => {
        if (!cancelled) setSelectedFacilityCount({ key: selectedKey, value: 0 })
      })

    return () => {
      cancelled = true
    }
  }, [selectedAccreditations, selectedKey])

  const visibleAccreditations = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    const filtered = accreditations.filter((accreditation) => {
      const matchesCategory = activeCategory === 'all' || accreditation.category === activeCategory
      const matchesQuery = !normalized
        || accreditation.shortName.toLowerCase().includes(normalized)
        || accreditation.name.toLowerCase().includes(normalized)
      return matchesCategory && matchesQuery
    })

    return [...filtered].sort((a, b) => b.facilityCount - a.facilityCount || a.shortName.localeCompare(b.shortName))
  }, [accreditations, activeCategory, searchQuery])

  const displayFacilityCount = selectedAccreditations.length === 0
    ? totalFacilities
    : (selectedFacilityCount?.key === selectedKey ? selectedFacilityCount.value : '—')

  const toggleAccreditation = (accreditationId: string) => {
    if (selectedAccreditations.includes(accreditationId)) {
      onSelectionChange(selectedAccreditations.filter((id) => id !== accreditationId))
      return
    }

    onSelectionChange([...selectedAccreditations, accreditationId])
  }

  if (isLoading) {
    return (
      <Card className="rounded-[1.5rem] border-white/70 bg-white/85">
        <CardContent className="flex min-h-[320px] items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-[1.5rem] border-white/70 bg-white/85 shadow-[0_18px_50px_-36px_rgba(15,118,110,0.45)]">
      <CardHeader className="space-y-4 px-5 pb-0 pt-5">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Accreditations
          </CardTitle>
          {selectedAccreditations.length > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onSelectionChange([])} className="rounded-full">
              Clear
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[1.1rem] border border-primary/10 bg-primary/[0.06] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Selected
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {selectedAccreditations.length}
            </p>
          </div>
          <div className="rounded-[1.1rem] border border-border/70 bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Facilities
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {displayFacilityCount}
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search accreditations"
            className="h-11 rounded-[1rem] border-border/70 bg-white pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'regulatory', 'quality', 'environmental', 'international'] as const).map((category) => {
            const count = category === 'all'
              ? accreditations.length
              : accreditations.filter((accreditation) => accreditation.category === category).length

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                  activeCategory === category
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border/70 bg-white text-foreground hover:border-primary/20'
                }`}
              >
                {category === 'all' ? 'All' : accreditationCategories[category]}
                <span className={`rounded-full px-1.5 py-0.5 font-mono ${activeCategory === category ? 'bg-white/15' : 'bg-muted text-muted-foreground'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-5">
        <ScrollArea className="h-[320px] pr-4">
          <div className="space-y-2.5">
            {visibleAccreditations.map((accreditation) => {
              const isSelected = selectedAccreditations.includes(accreditation.id)
              return (
                <button
                  key={accreditation.id}
                  type="button"
                  onClick={() => toggleAccreditation(accreditation.id)}
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
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {accreditation.shortName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {accreditation.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={`${accreditationColors[accreditation.category]} hidden sm:inline-flex`}>
                      {accreditationCategories[accreditation.category]}
                    </Badge>
                    <Badge variant="secondary" className="font-mono">
                      {accreditation.facilityCount}
                    </Badge>
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
