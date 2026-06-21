import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/react'
import { Beaker, Check, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { fetchFacilityCountByChemistries } from '@/lib/filterDataApi'
import { useFilterData } from '@/contexts/FilterDataContext'

interface ChemistryFilterProps {
  selectedChemistries: string[]
  onSelectionChange: (selected: string[]) => void
}

export function ChemistryFilter({
  selectedChemistries,
  onSelectionChange,
}: ChemistryFilterProps) {
  const { getToken } = useAuth()
  const { chemistries, totalFacilities, isLoading, error, hasLoadedData } = useFilterData()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFacilityCount, setSelectedFacilityCount] = useState<{ key: string; value: number } | null>(null)
  const [countError, setCountError] = useState<{ key: string; message: string } | null>(null)

  const selectedKey = selectedChemistries.join('|')

  useEffect(() => {
    if (!selectedKey) return

    let cancelled = false
    fetchFacilityCountByChemistries(getToken, selectedChemistries)
      .then((count) => {
        if (!cancelled) setSelectedFacilityCount({ key: selectedKey, value: count })
      })
      .catch((err) => {
        console.error('Error fetching chemistry facility count:', err)
        if (!cancelled) {
          setCountError({
            key: selectedKey,
            message: err instanceof Error ? err.message : 'Failed to load matching facilities.',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [getToken, selectedChemistries, selectedKey])

  const visibleChemistries = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    const filtered = normalized
      ? chemistries.filter((chemistry) => chemistry.facilityCount > 0 && chemistry.name.toLowerCase().includes(normalized))
      : chemistries.filter((chemistry) => chemistry.facilityCount > 0)

    return [...filtered].sort((a, b) => b.facilityCount - a.facilityCount || a.name.localeCompare(b.name))
  }, [chemistries, searchQuery])

  const selectedChemistryObjects = useMemo(
    () => chemistries.filter((chemistry) => selectedChemistries.includes(chemistry.id)),
    [chemistries, selectedChemistries]
  )

  const displayFacilityCount = selectedChemistries.length === 0
    ? totalFacilities
    : countError?.key === selectedKey
      ? 'Unavailable'
      : (selectedFacilityCount?.key === selectedKey ? selectedFacilityCount.value : '—')

  const toggleChemistry = (chemistryId: string) => {
    onSelectionChange(
      selectedChemistries.includes(chemistryId)
        ? selectedChemistries.filter((id) => id !== chemistryId)
        : [...selectedChemistries, chemistryId]
    )
  }

  if (isLoading && !hasLoadedData) {
    return (
      <Card className="rounded-[1.75rem] border-[#d7ece8] bg-white/90">
        <CardContent className="flex min-h-[320px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/15 border-t-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error && !hasLoadedData) {
    return (
      <Card className="rounded-[1.75rem] border-[#d7ece8] bg-white/90">
        <CardContent className="flex min-h-[260px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
          Chemistry data is unavailable right now.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-[1.75rem] border-[#d7ece8] bg-white/88 shadow-[0_30px_80px_-56px_rgba(15,118,110,0.45)]">
      <CardHeader className="space-y-4 px-5 pb-0 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Beaker className="h-5 w-5 text-primary" />
              Chemistries
            </CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Filter by chemistry capability.
            </p>
          </div>

          {selectedChemistries.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelectionChange([])}
              className="rounded-full border-[#d7ece8] bg-white"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="grid items-stretch gap-3 sm:grid-cols-3">
          <div className="flex min-h-[126px] flex-col justify-between rounded-[1.2rem] border border-[#d7ece8] bg-[linear-gradient(180deg,rgba(15,118,110,0.07),rgba(15,118,110,0.02))] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Selected
            </p>
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              {selectedChemistries.length}
            </p>
          </div>
          <div className="flex min-h-[126px] flex-col justify-between rounded-[1.2rem] border border-[#d7ece8] bg-white px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Matching facilities
            </p>
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              {displayFacilityCount}
            </p>
          </div>
          <div className="flex min-h-[126px] flex-col justify-between rounded-[1.2rem] border border-[#d7ece8] bg-white px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Available chemistries
            </p>
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              {chemistries.filter((chemistry) => chemistry.facilityCount > 0).length}
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search chemistry capabilities"
            className="h-12 rounded-[1rem] border-[#d7ece8] bg-white pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedChemistryObjects.length > 0 ? (
            selectedChemistryObjects.map((chemistry) => (
              <Badge
                key={chemistry.id}
                className="border-primary/10 bg-primary/10 px-3 py-1.5 text-primary"
              >
                {chemistry.name}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No chemistry filters selected.</p>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-5">
        <ScrollArea className="h-[320px] pr-4">
          <div className="space-y-2.5">
            {visibleChemistries.map((chemistry) => {
              const isSelected = selectedChemistries.includes(chemistry.id)
              return (
                <button
                  key={chemistry.id}
                  type="button"
                  onClick={() => toggleChemistry(chemistry.id)}
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
                      {chemistry.name}
                    </span>
                  </div>

                  <span className="text-sm font-medium text-muted-foreground">
                    {chemistry.facilityCount.toLocaleString()}
                  </span>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
