import { Building2, MapPinned, Package, Users2 } from 'lucide-react'
import { useFilterData } from '@/contexts/FilterDataContext'

export function StatsCards() {
  const { totalFacilities, stateLocations, platformStats, isLoading } = useFilterData()

  const stats = [
    {
      label: 'Facilities',
      value: isLoading ? '—' : totalFacilities.toLocaleString(),
      icon: <Building2 className="h-4 w-4" />,
    },
    {
      label: 'Products',
      value: isLoading ? '—' : platformStats.products.toLocaleString(),
      icon: <Package className="h-4 w-4" />,
    },
    {
      label: 'Manufacturers',
      value: isLoading ? '—' : platformStats.manufacturers.toLocaleString(),
      icon: <Users2 className="h-4 w-4" />,
    },
    {
      label: 'Locations',
      value: isLoading ? '—' : stateLocations.length.toLocaleString(),
      icon: <MapPinned className="h-4 w-4" />,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center justify-between rounded-[1.25rem] border border-white/80 bg-white/78 px-4 py-4 shadow-[0_14px_40px_-32px_rgba(15,118,110,0.45)]"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {stat.value}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  )
}
