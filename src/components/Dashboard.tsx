import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  Beaker,
  Building2,
  LayoutDashboard,
  Package,
  Search,
} from 'lucide-react'
import { FilterDataProvider } from '@/contexts/FilterDataContext'
import { useFilterData } from '@/contexts/FilterDataContext'
import type { FilterState } from '@/lib/filterData'
import { LocationFilter } from './LocationFilter'
import { ChemistryFilter } from './ChemistryFilter'
import { AccreditationFilter } from './AccreditationFilter'
import { FilterSummary } from './FilterSummary'
import { ProductSearch } from './product-search'

type DashboardTab = 'overview' | 'search'

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
          ? 'bg-primary text-primary-foreground shadow-[0_12px_30px_-18px_rgba(15,118,110,0.9)]'
          : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function DashboardContent() {
  const { isLoading, platformStats, totalFacilities } = useFilterData()
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
  const [selectedChemistries, setSelectedChemistries] = useState<string[]>([])
  const [selectedAccreditations, setSelectedAccreditations] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])

  const filters: FilterState = {
    chemistries: selectedChemistries,
    accreditations: selectedAccreditations,
    locations: selectedLocations,
  }

  const clearAllFilters = () => {
    setSelectedChemistries([])
    setSelectedAccreditations([])
    setSelectedLocations([])
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_22%),linear-gradient(180deg,#f4fbfa_0%,#f8faf9_44%,#f3f8f7_100%)]" />

      <div className="relative z-10">
        <header className="sticky top-0 z-30 border-b border-white/70 bg-background/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-primary text-white shadow-[0_20px_40px_-24px_rgba(15,118,110,0.95)]">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold tracking-tight text-foreground">
                  Capillia
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  Covenants Platform
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-full border border-white/80 bg-white/88 p-1 shadow-sm">
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
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
          {activeTab === 'overview' ? (
            <div className="space-y-6">
              <section className="rounded-[2rem] border border-[#d7ece8] bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(237,248,246,0.92))] p-5 shadow-[0_40px_100px_-70px_rgba(15,118,110,0.55)] sm:p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      Platform overview
                    </p>
                    <h2 className="text-3xl font-semibold tracking-tight text-foreground">
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
                <div className="flex min-h-[126px] flex-col justify-between rounded-[1.2rem] border border-[#d7ece8] bg-[linear-gradient(180deg,rgba(15,118,110,0.07),rgba(15,118,110,0.02))] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Products
                  </p>
                  <p className="text-3xl font-semibold tracking-tight text-foreground">
                    {isLoading ? '—' : platformStats.products.toLocaleString()}
                  </p>
                </div>

                <div className="flex min-h-[126px] flex-col justify-between rounded-[1.2rem] border border-[#d7ece8] bg-white px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Available chemistries
                  </p>
                  <p className="text-3xl font-semibold tracking-tight text-foreground">
                    {isLoading ? '—' : platformStats.chemistries.toLocaleString()}
                  </p>
                </div>

                <div className="flex min-h-[126px] flex-col justify-between rounded-[1.2rem] border border-[#d7ece8] bg-white px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Facilities
                  </p>
                  <p className="text-3xl font-semibold tracking-tight text-foreground">
                    {isLoading ? '—' : totalFacilities.toLocaleString()}
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
