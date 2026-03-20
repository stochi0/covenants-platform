import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Search,
} from 'lucide-react'
import { FilterDataProvider } from '@/contexts/FilterDataContext'
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

function DashboardContent({
  onSignOut,
  userEmail,
}: {
  onSignOut: () => Promise<void> | void
  userEmail: string
}) {
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
                  A Covenants Product
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden rounded-full border border-white/80 bg-white/88 px-4 py-2 text-sm text-muted-foreground shadow-sm md:block">
                {userEmail}
              </div>
              <div className="inline-flex rounded-full border border-white/80 bg-white/88 p-1 shadow-sm">
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

              <button
                type="button"
                onClick={() => void onSignOut()}
                className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/88 px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-white"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
          {activeTab === 'overview' ? (
            <div className="space-y-6">
              <FilterSummary
                filters={filters}
                onChemistryRemove={(id) => setSelectedChemistries((prev) => prev.filter((item) => item !== id))}
                onAccreditationRemove={(id) => setSelectedAccreditations((prev) => prev.filter((item) => item !== id))}
                onLocationRemove={(id) => setSelectedLocations((prev) => prev.filter((item) => item !== id))}
                onClearAll={clearAllFilters}
              />

              <LocationFilter
                selectedLocations={selectedLocations}
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

export function Dashboard({
  onSignOut,
  userEmail,
}: {
  onSignOut: () => Promise<void> | void
  userEmail: string
}) {
  return (
    <FilterDataProvider>
      <DashboardContent onSignOut={onSignOut} userEmail={userEmail} />
    </FilterDataProvider>
  )
}
