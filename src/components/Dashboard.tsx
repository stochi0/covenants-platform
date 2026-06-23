import type { ReactNode } from 'react'
import { lazy, Suspense, useMemo, useState } from 'react'
import { SignOutButton, useUser } from '@clerk/react'
import {
  Beaker,
  Building2,
  LogOut,
  LayoutDashboard,
  Package,
  RefreshCw,
  Search,
  UserCircle,
} from 'lucide-react'
import { FilterDataProvider } from '@/contexts/FilterDataContext'
import { useFilterData } from '@/contexts/FilterDataContext'
import type { FilterState } from '@/lib/filterData'
import { Button } from '@/components/ui/button'
import { LocationFilter } from './LocationFilter'
import { ChemistryFilter } from './ChemistryFilter'
import { AccreditationFilter } from './AccreditationFilter'
import { FilterSummary } from './FilterSummary'

type DashboardTab = 'overview' | 'search'

const ProductSearch = lazy(() =>
  import('./product-search').then((module) => ({ default: module.ProductSearch }))
)

function TabLoadingFallback({ label }: { label: string }) {
  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-[1.75rem] border border-[#d7ece8] bg-white/88">
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/15 border-t-primary" />
        <span>{label}</span>
      </div>
    </div>
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
      className={`inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-xs font-medium transition-colors sm:flex-none sm:px-4 sm:text-sm ${
        active
          ? 'bg-primary text-primary-foreground shadow-[0_12px_30px_-18px_rgba(15,118,110,0.9)]'
          : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  )
}

function AccountMenu() {
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
    || user?.primaryEmailAddress?.emailAddress
    || 'Account'
  const email = user?.primaryEmailAddress?.emailAddress

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/88 text-foreground shadow-sm transition-colors hover:bg-white"
        aria-label="Open account menu"
        aria-expanded={isOpen}
      >
        <UserCircle className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-40 w-64 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-medium">{displayName}</p>
            {email && <p className="truncate text-xs text-muted-foreground">{email}</p>}
          </div>
          <SignOutButton>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </SignOutButton>
        </div>
      )}
    </div>
  )
}

function DashboardContent() {
  const { isLoading, error, hasLoadedData, platformStats, totalFacilities, refresh } = useFilterData()
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
  const [selectedChemistries, setSelectedChemistries] = useState<string[]>([])
  const [selectedAccreditations, setSelectedAccreditations] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])

  const filters: FilterState = useMemo(() => ({
    chemistries: selectedChemistries,
    accreditations: selectedAccreditations,
    locations: selectedLocations,
  }), [selectedAccreditations, selectedChemistries, selectedLocations])

  const clearAllFilters = () => {
    setSelectedChemistries([])
    setSelectedAccreditations([])
    setSelectedLocations([])
  }

  const dataUnavailable = Boolean(error && !hasLoadedData)
  const formatOverviewValue = (value: number) => {
    if (isLoading && !hasLoadedData) return '—'
    if (dataUnavailable) return 'Data unavailable'
    return value.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_22%),linear-gradient(180deg,#f4fbfa_0%,#f8faf9_44%,#f3f8f7_100%)]" />

      <div className="relative z-10">
        <header className="sticky top-0 z-30 border-b border-white/70 bg-background/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-primary text-white shadow-[0_20px_40px_-24px_rgba(15,118,110,0.95)] sm:h-12 sm:w-12 sm:rounded-[1.2rem]">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  Capillia
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  Covenants Platform
                </p>
              </div>
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
              <div className="grid min-w-0 flex-1 grid-cols-2 rounded-full border border-white/80 bg-white/88 p-1 shadow-sm sm:inline-flex sm:flex-none">
                <NavButton
                  active={activeTab === 'overview'}
                  label="Overview"
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  onClick={() => setActiveTab('overview')}
                />
                <NavButton
                  active={activeTab === 'search'}
                  label="Product Search"
                  icon={<Search className="h-4 w-4" />}
                  onClick={() => setActiveTab('search')}
                />
              </div>
              <AccountMenu />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-3 py-4 sm:px-6 sm:py-8">
          {error && (
            <div className="mb-6 flex flex-col gap-3 rounded-[1.2rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between">
              <span>
                {hasLoadedData ? 'Using the last loaded data. Refresh failed.' : 'Data unavailable.'} {error}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void refresh()}
                className="w-fit rounded-full border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          )}

          {activeTab === 'overview' ? (
            <div className="space-y-6">
              <section className="rounded-[1.25rem] border border-[#d7ece8] bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(237,248,246,0.92))] p-4 shadow-[0_40px_100px_-70px_rgba(15,118,110,0.55)] sm:rounded-[2rem] sm:p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:tracking-[0.24em]">
                      Platform overview
                    </p>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      Find manufacturing capacity faster.
                    </h2>
                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                      Capillia helps you discover facilities by location, chemistry capability, and accreditation—then match them to the products you care about.
                    </p>
                  </div>

                  <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[520px]">
                    <div className="flex items-start gap-3 rounded-[1.2rem] border border-[#d7ece8] bg-white/85 px-4 py-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">Filter coverage</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Explore facilities across India with state-level filtering.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-[1.2rem] border border-[#d7ece8] bg-white/85 px-4 py-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Beaker className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">Match by capability</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Narrow down by chemistry capabilities and accreditations.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-[1.2rem] border border-[#d7ece8] bg-white/85 px-4 py-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Package className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">Search products</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Look up products and build a shortlist for RFQ.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid items-stretch gap-3 sm:grid-cols-3">
                <div className="flex min-h-[104px] flex-col justify-between rounded-[1rem] border border-[#d7ece8] bg-[linear-gradient(180deg,rgba(15,118,110,0.07),rgba(15,118,110,0.02))] px-4 py-4 sm:min-h-[126px] sm:rounded-[1.2rem]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:tracking-[0.18em]">
                    Products
                  </p>
                  <p className="break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {formatOverviewValue(platformStats.products)}
                  </p>
                </div>

                <div className="flex min-h-[104px] flex-col justify-between rounded-[1rem] border border-[#d7ece8] bg-white px-4 py-4 sm:min-h-[126px] sm:rounded-[1.2rem]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:tracking-[0.18em]">
                    Available chemistries
                  </p>
                  <p className="break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {formatOverviewValue(platformStats.chemistries)}
                  </p>
                </div>

                <div className="flex min-h-[104px] flex-col justify-between rounded-[1rem] border border-[#d7ece8] bg-white px-4 py-4 sm:min-h-[126px] sm:rounded-[1.2rem]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:tracking-[0.18em]">
                    Facilities
                  </p>
                  <p className="break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {formatOverviewValue(totalFacilities)}
                  </p>
                </div>
              </div>

              <FilterSummary
                filters={filters}
                onChemistryRemove={(id) => setSelectedChemistries((prev) => prev.filter((item) => item !== id))}
                onAccreditationRemove={(id) => setSelectedAccreditations((prev) => prev.filter((item) => item !== id))}
                onLocationRemove={(id) => setSelectedLocations((prev) => prev.filter((item) => item !== id))}
                onClearAll={clearAllFilters}
              />

              <LocationFilter
                selectedLocations={selectedLocations}
                selectedChemistries={selectedChemistries}
                selectedAccreditations={selectedAccreditations}
                onSelectionChange={setSelectedLocations}
              />

              <div className="grid gap-6 xl:grid-cols-2">
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
          ) : (
            <Suspense fallback={<TabLoadingFallback label="Loading product search" />}>
              <ProductSearch filters={filters} />
            </Suspense>
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
