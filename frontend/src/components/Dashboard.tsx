import { useEffect, useState } from "react";
import { Building2, MapPin, FlaskConical, Package } from "lucide-react";
import { FilterPanel, type Filters } from "./FilterPanel";
import { StatsCard } from "./StatsCard";
import { LocationsTable } from "./LocationsTable";
import { ChemistryChart } from "./ChemistryChart";
import { ProductsLeaderboard } from "./ProductsLeaderboard";
import {
  fetchLocationStats,
  fetchChemistryStats,
  fetchProductStats,
  type LocationStat,
  type ChemistryStat,
  type ProductStatByCompany,
  type ProductStatGlobal,
  type StatsFilters,
} from "@/lib/api";

export function Dashboard() {
  const [filters, setFilters] = useState<Filters>({
    country: "",
    state: "",
    city: "",
    chemistries: [],
  });

  const [loading, setLoading] = useState({
    locations: false,
    chemistries: false,
    products: false,
  });

  const [locations, setLocations] = useState<LocationStat[]>([]);
  const [chemistries, setChemistries] = useState<ChemistryStat[]>([]);
  const [companyProducts, setCompanyProducts] = useState<ProductStatByCompany[]>([]);
  const [globalProducts, setGlobalProducts] = useState<ProductStatGlobal[]>([]);

  // Convert filters to API format
  const apiFilters: StatsFilters = {
    country: filters.country || undefined,
    state: filters.state || undefined,
    city: filters.city || undefined,
    chemistries: filters.chemistries.length > 0 ? filters.chemistries : undefined,
  };

  // Fetch data whenever filters change
  useEffect(() => {
    const fetchData = async () => {
      // Fetch locations
      setLoading((prev) => ({ ...prev, locations: true }));
      try {
        const locData = await fetchLocationStats("country", 10, apiFilters);
        setLocations(locData as LocationStat[]);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setLocations([]);
      } finally {
        setLoading((prev) => ({ ...prev, locations: false }));
      }

      // Fetch chemistries
      setLoading((prev) => ({ ...prev, chemistries: true }));
      try {
        const chemData = await fetchChemistryStats(20, apiFilters);
        setChemistries(chemData);
      } catch (error) {
        console.error("Error fetching chemistries:", error);
        setChemistries([]);
      } finally {
        setLoading((prev) => ({ ...prev, chemistries: false }));
      }

      // Fetch products
      setLoading((prev) => ({ ...prev, products: true }));
      try {
        const [companyData, globalData] = await Promise.all([
          fetchProductStats("company", 10, apiFilters),
          fetchProductStats("global", 50, apiFilters),
        ]);
        setCompanyProducts(companyData as ProductStatByCompany[]);
        setGlobalProducts(globalData as ProductStatGlobal[]);
      } catch (error) {
        console.error("Error fetching products:", error);
        setCompanyProducts([]);
        setGlobalProducts([]);
      } finally {
        setLoading((prev) => ({ ...prev, products: false }));
      }
    };

    fetchData();
  }, [filters]);

  // Calculate summary stats
  const totalLocations = locations.reduce((sum, loc) => sum + loc.count, 0);
  const totalChemistries = chemistries.length;
  const totalProducts = globalProducts.reduce((sum, prod) => sum + prod.count, 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">CDMO Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Explore global contract development and manufacturing organizations data
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Companies"
            value={totalLocations}
            icon={Building2}
            loading={loading.locations}
            description="Across all locations"
          />
          <StatsCard
            title="Locations"
            value={locations.length}
            icon={MapPin}
            loading={loading.locations}
            description="Top countries"
          />
          <StatsCard
            title="Chemistries"
            value={totalChemistries}
            icon={FlaskConical}
            loading={loading.chemistries}
            description="Process types"
          />
          <StatsCard
            title="Products"
            value={totalProducts}
            icon={Package}
            loading={loading.products}
            description="Total products"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Filters Sidebar */}
          <div className="lg:col-span-3">
            <FilterPanel filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Main Content */}
          <div className="space-y-6 lg:col-span-9">
            {/* Locations */}
            <LocationsTable
              locations={locations}
              loading={loading.locations}
              level="Country"
            />

            {/* Chemistry Distribution */}
            <ChemistryChart chemistries={chemistries} loading={loading.chemistries} />

            {/* Products Leaderboard */}
            <ProductsLeaderboard
              companyStats={companyProducts}
              globalStats={globalProducts}
              loading={loading.products}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

