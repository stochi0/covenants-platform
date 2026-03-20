import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Building2, Filter, LayoutDashboard, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { FilterDataProvider, useFilterData } from '@/contexts/FilterDataContext'
import type { FilterState } from '@/lib/filterData'
import { StatsCards } from './StatsCards'
import { LocationFilter } from './LocationFilter'
import { ChemistryFilter } from './ChemistryFilter'
import { AccreditationFilter } from './AccreditationFilter'
import { FilterSummary } from './FilterSummary'
import { ProductSearch } from './product-search'

type DashboardTab = 'overview' | 'search'

function OverviewHeader({
  onOpenSearch,
}: {
  onOpenSearch: () => void
}) {
  const { stateLocations, chemistries, accreditations } = useFilterData()

  const highlights = useMemo(() => {
    const topLocation = [...stateLocations].sort((a, b) => b.facilityCount - a.facilityCount)[0]
    const topChemistry = [...chemistries].sort((a, b) => b.facilityCount - a.facilityCount)[0]
    const topAccreditation = [...accreditations].sort((a, b) => b.facilityCount - a.facilityCount)[0]

    return [
      topLocation ? topLocation.name : null,
      topChemistry ? topChemistry.name : null,
      topAccreditation ? topAccreditation.shortName : null,
    ].filter(Boolean) as string[]
  }, [accreditations, chemistries, stateLocations])

  return (
    <Card className="rounded-[1.5rem] border-white/80 bg-white/84 shadow-[0_24px_80px_-52px_rgba(15,118,110,0.45)]">
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Find the right manufacturing partner.
            </h1>
            <div className="flex flex-wrap gap-2">
              {highlights.map((item) => (
                <Badge key={item} className="border-primary/10 bg-primary/10 px-3 py-1 text-primary">
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSearch}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Search className="h-4 w-4" />
            Search products
          </button>
        </div>

        <StatsCards />
      </CardContent>
    </Card>
  )
}

function NavButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean
  label: string
  icon: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')

  const [selectedChemistries, setSelectedChemistries] = useState<string[]>([])
  const [selectedAccreditations, setSelectedAccreditations] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])

  const filters: FilterState = {
    chemistries: selectedChemistries,
    accreditations: selectedAccreditations,
    locations: selectedLocations,
  }

  const hasActiveFilters = selectedChemistries.length > 0
    || selectedAccreditations.length > 0
    || selectedLocations.length > 0

  const clearAllFilters = () => {
    setSelectedChemistries([])
    setSelectedAccreditations([])
    setSelectedLocations([])
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_22%),linear-gradient(to_bottom,rgba(240,253,250,0.92),rgba(248,250,252,1))]" />

      <div className="relative z-10">
        <header className="sticky top-0 z-30 border-b border-white/70 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_18px_40px_-24px_rgba(15,118,110,0.9)]">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  Covenants Platform
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  Manufacturing intelligence
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-full border border-white/80 bg-white/82 p-1 shadow-sm">
                <NavButton
                  active={activeTab === 'overview'}
                  label="Overview"
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  onClick={() => setActiveTab('overview')}
                />
                <NavButton
                  active={activeTab === 'search'}
                  label="Search"
                  icon={<Search className="h-4 w-4" />}
                  onClick={() => setActiveTab('search')}
                />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          {activeTab === 'overview' ? (
            <div className="space-y-6">
              <OverviewHeader onOpenSearch={() => setActiveTab('search')} />

              {hasActiveFilters && (
                <FilterSummary
                  filters={filters}
                  onChemistryRemove={(id) => setSelectedChemistries((prev) => prev.filter((item) => item !== id))}
                  onAccreditationRemove={(id) => setSelectedAccreditations((prev) => prev.filter((item) => item !== id))}
                  onLocationRemove={(id) => setSelectedLocations((prev) => prev.filter((item) => item !== id))}
                  onClearAll={clearAllFilters}
                />
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Filter className="h-4 w-4" />
                  </div>
                  Filters
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
                <LocationFilter
                  selectedLocations={selectedLocations}
                  onSelectionChange={setSelectedLocations}
                />

                <div className="space-y-6">
                  <ChemistryFilter
                    selectedChemistries={selectedChemistries}
                    onSelectionChange={setSelectedChemistries}
                  />
                  <AccreditationFilter
                    selectedAccreditations={selectedAccreditations}
                    onSelectionChange={setSelectedAccreditations}
                  />
                </div>
              </div>
            </div>
          ) : (
            <ProductSearch />
          )}
        </main>
      </div>
    </div>
  )
}

export function Dashboard() {
  return (
    <FilterDataProvider>
      <DashboardContent />
    </FilterDataProvider>
  )
}
