import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/react'
import { Check, Search, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  const { getToken } = useAuth()
  const { accreditations, totalFacilities, isLoading, error, hasLoadedData } = useFilterData()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFacilityCount, setSelectedFacilityCount] = useState<{ key: string; value: number } | null>(null)
  const [countError, setCountError] = useState<{ key: string; message: string } | null>(null)

  const selectedKey = selectedAccreditations.join('|')

  useEffect(() => {
    if (!selectedKey) return

    let cancelled = false
    fetchFacilityCountByAccreditations(getToken, selectedAccreditations)
      .then((count) => {
        if (!cancelled) setSelectedFacilityCount({ key: selectedKey, value: count })
      })
      .catch((err) => {
        console.error('Error fetching accreditation facility count:', err)
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
  }, [getToken, selectedAccreditations, selectedKey])

  const visibleAccreditations = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    const filtered = normalized
      ? accreditations.filter((accreditation) =>
          accreditation.facilityCount > 0 && (
            accreditation.shortName.toLowerCase().includes(normalized)
            || accreditation.name.toLowerCase().includes(normalized)
          )
        )
      : accreditations.filter((accreditation) => accreditation.facilityCount > 0)

    return [...filtered].sort((a, b) => b.facilityCount - a.facilityCount || a.shortName.localeCompare(b.shortName))
  }, [accreditations, searchQuery])

  const selectedAccreditationObjects = useMemo(
    () => accreditations.filter((accreditation) => selectedAccreditations.includes(accreditation.id)),
    [accreditations, selectedAccreditations]
  )

  const displayFacilityCount = selectedAccreditations.length === 0
    ? totalFacilities
    : countError?.key === selectedKey
      ? 'Unavailable'
      : (selectedFacilityCount?.key === selectedKey ? selectedFacilityCount.value : '—')

  const toggleAccreditation = (accreditationId: string) => {
    onSelectionChange(
      selectedAccreditations.includes(accreditationId)
        ? selectedAccreditations.filter((id) => id !== accreditationId)
        : [...selectedAccreditations, accreditationId]
    )
  }

  if (isLoading && !hasLoadedData) {
    return (
      <Card className="rounded-[1.25rem] border-[#d7ece8] bg-white/90 sm:rounded-[1.75rem]">
        <CardContent className="flex min-h-[320px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/15 border-t-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error && !hasLoadedData) {
    return (
      <Card className="rounded-[1.25rem] border-[#d7ece8] bg-white/90 sm:rounded-[1.75rem]">
        <CardContent className="flex min-h-[260px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
          Accreditation data is unavailable right now.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-[1.25rem] border-[#d7ece8] bg-white/88 shadow-[0_30px_80px_-56px_rgba(15,118,110,0.45)] sm:rounded-[1.75rem]">
      <CardHeader className="space-y-4 px-4 pt-4 pb-0 sm:px-5 sm:pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Accreditations
            </CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Narrow results by accreditation.
            </p>
          </div>

          {selectedAccreditations.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelectionChange([])}
              className="w-full rounded-full border-[#d7ece8] bg-white sm:w-auto"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="grid items-stretch gap-3 sm:grid-cols-3">
          <div className="flex min-h-[104px] flex-col justify-between rounded-[1rem] border border-[#d7ece8] bg-[linear-gradient(180deg,rgba(15,118,110,0.07),rgba(15,118,110,0.02))] px-4 py-4 sm:min-h-[126px] sm:rounded-[1.2rem]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:tracking-[0.18em]">
              Selected
            </p>
            <p className="break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {selectedAccreditations.length}
            </p>
          </div>
          <div className="flex min-h-[104px] flex-col justify-between rounded-[1rem] border border-[#d7ece8] bg-white px-4 py-4 sm:min-h-[126px] sm:rounded-[1.2rem]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:tracking-[0.18em]">
              Matching facilities
            </p>
            <p className="break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {displayFacilityCount}
            </p>
          </div>
          <div className="flex min-h-[104px] flex-col justify-between rounded-[1rem] border border-[#d7ece8] bg-white px-4 py-4 sm:min-h-[126px] sm:rounded-[1.2rem]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:tracking-[0.18em]">
              Available accreditations
            </p>
            <p className="break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {accreditations.filter((accreditation) => accreditation.facilityCount > 0).length}
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search accreditations"
            className="h-12 rounded-[1rem] border-[#d7ece8] bg-white pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedAccreditationObjects.length > 0 ? (
            selectedAccreditationObjects.map((accreditation) => (
              <Badge
                key={accreditation.id}
                className="border-primary/10 bg-primary/10 px-3 py-1.5 text-primary"
              >
                {accreditation.shortName}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No accreditation filters selected.</p>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4 pt-5 pb-4 sm:px-5 sm:pb-5">
        <ScrollArea className="h-[280px] pr-2 sm:h-[320px] sm:pr-4">
          <div className="space-y-2.5">
            {visibleAccreditations.map((accreditation) => {
              const isSelected = selectedAccreditations.includes(accreditation.id)
              return (
                <button
                  key={accreditation.id}
                  type="button"
                  onClick={() => toggleAccreditation(accreditation.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-[1rem] border px-3 py-3 text-left transition-colors sm:rounded-[1.1rem] sm:px-4 ${
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
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {accreditation.shortName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {accreditation.name}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 text-sm font-medium text-muted-foreground">
                    {accreditation.facilityCount.toLocaleString()}
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
