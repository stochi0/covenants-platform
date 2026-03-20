import { Building2, MapPinned, Package, Users2 } from 'lucide-react'
import { useFilterData } from '@/contexts/FilterDataContext'

export function StatsCards() {
  const { totalFacilities, stateLocations, platformStats, isLoading } = useFilterData()

  const stats = [
    {
      label: 'Facilities',
      value: isLoading ? '—' : totalFacilities.toLocaleString(),
      hint: 'Active manufacturing sites',
      icon: <Building2 className="h-4 w-4" />,
    },
    {
      label: 'Products',
      value: isLoading ? '—' : platformStats.products.toLocaleString(),
      hint: 'Searchable portfolio records',
      icon: <Package className="h-4 w-4" />,
    },
    {
      label: 'Manufacturers',
      value: isLoading ? '—' : platformStats.manufacturers.toLocaleString(),
      hint: 'Distinct companies',
      icon: <Users2 className="h-4 w-4" />,
    },
    {
      label: 'Locations',
      value: isLoading ? '—' : stateLocations.filter((location) => location.facilityCount > 0).length.toLocaleString(),
      hint: 'States with live coverage',
      icon: <MapPinned className="h-4 w-4" />,
    },
  ]

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-[1.4rem] border border-[#d7ece8] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(243,251,250,0.9))] px-4 py-4 shadow-[0_24px_60px_-48px_rgba(15,118,110,0.55)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {stat.icon}
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {stat.label}
            </p>
          </div>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            {stat.value}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{stat.hint}</p>
        </div>
      ))}
    </div>
  )
}
